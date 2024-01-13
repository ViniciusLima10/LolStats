import React, { useState } from 'react';
import './styles.css';
import logo2 from "../../assets/logo2.svg";
import inputIcon from "../../assets/inputIcon.svg";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Summoner() {
    const [invocador, setInvocador] = useState(''); // Adicione o estado para o input
    const location = useLocation();
    const summonerData = location.state?.summonerData;
    const navigate = useNavigate();

    const handleButtonClick = async () => {
        try {
          // Verifique se há um valor válido no input antes de fazer a consulta
          if (invocador.trim() === '') {
            alert('Por favor, insira um nome de invocador válido.');
            return; // Sai da função se o input estiver vazio
          }
    
          const apiUrl = `http://localhost:1010/invocador/${encodeURIComponent(invocador)}`;
          const response = await axios.get(apiUrl);
    
          const data = response.data;
    
          // Faça algo com os dados, como exibir em um alert
          navigate('/invocador', { state: { summonerData: data } });
        } catch (error) {
          console.error('Erro ao consultar a API:', error);
        }
      };

    return (
        <div className="Summoner">
            <nav className="Navbar">
                <div>
                    <img className="logo" src={logo2} alt="LolStats" />
                </div>

                <div className="input-with-button">
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Digite um nome de invocador..."
                        value={invocador} // Vincule o valor do input ao estado
                        onChange={(e) => setInvocador(e.target.value)} // Atualize o estado quando o input mudar
                    />
                    <button className="svg-button" onClick={handleButtonClick}>
                        <img src={inputIcon} alt="Botão SVG" />
                    </button>
                </div>
            </nav>

            <div className="container">
                {summonerData ? (
                    <div>
                        <div className='container-nav'>
                            <img className="icon" src={`http://ddragon.leagueoflegends.com/cdn/13.16.1/img/profileicon/${summonerData.icone}.png`} alt="Ícone do Invocador" />
                            <h1>{summonerData.nome} | {summonerData.nivel}</h1>
                        </div>
                        <p>{summonerData.elo} {summonerData.divisao}</p> 
                        <p>Vitórias: {summonerData.partidasGanhas} Derrotas: {summonerData.partidasPerdidas}</p>
                        <p></p>
                    </div>
                ) : (
                    <p>Nenhum dado do invocador disponível.</p>
                )}
            </div>
        </div>
    );
}

export default Summoner;
