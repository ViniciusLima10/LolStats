import './styles.css';
import logo1 from '../../assets/logo1.svg';
import akali from '../../assets/akali.svg';
import inputIcon from '../../assets/inputIcon.svg';
import axios from 'axios';
import { useState } from 'react'; // Importe o useState do React
import { useNavigate } from 'react-router-dom';

function Home() {
  const [invocador, setInvocador] = useState(''); // Crie um estado para o valor do input
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

      console.log(data)

      // Faça algo com os dados, como exibir em um alert
      navigate('/invocador', { state: { summonerData: data } });
    } catch (error) {
      console.error('Erro ao consultar a API:', error);
    }
  };

  return (
    <div className="Home">
      <div className="leftContainer">
        <div className="logo">
          <img src={logo1} alt="" />
        </div>
        <div className="footer">
          <p>por Vinicius Lima</p>
        </div>
      </div>
      <div className="rightContainer">
        <h2>Pesquise um nome de invocador!</h2>
        <img className='backgraundChampion' src={akali} alt="" />
        <div className="input-with-button">
          <input
            type="text"
            className="input-field"
            placeholder="Digite um nome de invocador..."
            value={invocador}
            onChange={(e) => setInvocador(e.target.value)} // Atualize o estado do input
          />
          <button className="svg-button" onClick={handleButtonClick}>
            <img src={inputIcon} alt="Botão SVG" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
