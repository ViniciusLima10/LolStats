const axios = require('axios');
const express = require('express');

const app = express();
const port = 1010; // Escolha uma porta adequada

// Chave da API do League of Legends (você deve obter a sua em https://developer.riotgames.com/)
const apiKey = 'RGAPI-d6ee2b82-4f5d-49c2-b619-14a6241b32f6';

// Configuração para permitir solicitações CORS (não recomendado em produção)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

async function getItemData(itemId, apiKey) {
  try {
    const response = await axios.get(`https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/item.json`, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });

    const itemsData = response.data.data;
    const item = itemsData[itemId];

    if (item) {
      const imageUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${item.image.full}`;
      console.log(`Item Image URL: ${imageUrl}`);
    } else {
      console.log(`Item with ID ${itemId} not found.`);
    }

  } catch (err) {
    console.error(err);
  }
}


// Função para obter informações de classificação (elo) do invocador
async function getSummonerRank(id) {
  try {
    const rankedInfo = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });

    // Verifica se o invocador possui classificação
    if (rankedInfo.data.length > 0) {
      const rankedData = rankedInfo.data[0];
      return {
        tier: rankedData.tier,
        division: rankedData.rank,
        wins: rankedData.wins,
        losses: rankedData.losses,
        leaguePoints: rankedData.leaguePoints,
      };
    } else {
      // O invocador não possui classificação
      return {
        tier: 'Unranked',
        division: '',
        wins: 0,
        losses: 0,
        leaguePoints: 0,
      };
    }
  } catch (error) {
    console.error('Erro ao obter informações de classificação do invocador:', error);
    throw error;
  }
}

async function getSummonerMatches(puuid) {
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`;

  try {
    const matches = await axios.get(url, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });
    return Array.from(matches.data);
    
  } catch (error) {
    console.error('Erro ao obter informações de partidas do invocador:');
    throw error;
  }


}
//BR1_2871919359

async function getMatchData(matchId) {
  const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  try{
    const match = await axios.get(url, {
      headers: {
        'X-Riot-Token': apiKey,
      }
    });
    const participants = match.data.info.participants 
    const matchPlayer= []
    timeVencedor = match.data.info.teams[0].win ? 1 : 2
    matchPlayer.push(timeVencedor)
    for(player of participants) {
      const playerData = {
        puuid: player.puuid,
        champion: player.championName,
        kills:	player.kills,
        deaths: player.deaths,
        goldEarned: player.goldEarned,
        individualPosition: player.individualPosition,
        itens: {
          item0: player.item0,
          item1: player.item1,
          item2: player.item2,
          item3: player.item3,
          item4: player.item4,
          item5: player.item5
        },
        physicalDamageDealtToChampion:	player.physicalDamageDealtToChampions,
        physicalDamageTaken:	player.physicalDamageTaken,
      }
      matchPlayer.push(playerData)
    }
    return matchPlayer;
  } catch (error) {
    console.log("erro ao obter informacoes de partida")
  }
}


// Rota para obter informações do invocador
app.get('/invocador/:nome', async (req, res) => {
  const { nome } = req.params;

  try {
    // Obtém informações do invocador
    const summonerInfoPromise = axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${nome}`, {
      headers: {
        'X-Riot-Token': apiKey,
      },
    });

    // Executa as operações assíncronas em paralelo
    const [summonerInfo] = await Promise.all([summonerInfoPromise]);

    // Obtém o ID e PUUID do invocador
    const { id, puuid } = summonerInfo.data;

    // Obtém informações do nível
    const summonerLevel = summonerInfo.data.summonerLevel;

    // Obtém informações de elo (classificação)
    const summonerRankPromise = getSummonerRank(id);
    // Obtém id das ultimas partidas (classificação)
    const summonerMatchesPromise = getSummonerMatches(puuid);

    // Executa as operações assíncronas em paralelo
    const [summonerRank, summonerMatches] = await Promise.all([summonerRankPromise, summonerMatchesPromise]);

    // Obtém informações de partida (classificação)
    const matchPromises = summonerMatches.map(async (match) => {
      return await getMatchData(match);
    });

    // Executa as operações assíncronas de obtenção de informações de partida em paralelo
    const matchs = await Promise.all(matchPromises);

    // Formata a resposta
    const response = {
      id: id,
      nome: nome,
      nivel: summonerLevel,
      elo: summonerRank.tier,
      divisao: summonerRank.division,
      partidasGanhas: summonerRank.wins,
      partidasPerdidas: summonerRank.losses,
      leaguePoints: summonerRank.leaguePoints,
      icone: summonerInfo.data.profileIconId,
      puuid: puuid,
      summonerMatches: summonerMatches,
      matchs: matchs
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar informações do invocador' });
  }
});
// Inicia o servidor
app.listen(port, () => {
  console.log(`API do League of Legends está rodando em http://localhost:${port}`);
});
