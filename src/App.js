import React, { useState } from 'react';
import './App.css';
const App = () => {
  const [error, setError] = useState(null)
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)

  const Timeout = 120
  const [chatHistory, setChatHistory] = useState([])

  let data;
  //to clear the input field
  const clear = () => {
    setError(null)
    setValue('')
  }



  //options to select randomly from 
  const selectRandomOPtions = [
    "What is the difference between Bitcoin and Ethereum?",
    "Explain the concept of a blockchain and how it works.",
    "What is a cryptocurrency wallet, and what are the different types?",
    "What are the main benefits and drawbacks of investing in cryptocurrencies?",
    "How does Proof-of-Work (PoW) differ from Proof-of-Stake (PoS) consensus mechanisms?",
    "What are smart contracts, and how are they used in the crypto space?",
    "What is a decentralized finance (DeFi) application, and what are some examples?",
    "Explain the role of oracles in the cryptocurrency ecosystem",
    "What are non-fungible tokens (NFTs), and how do they differ from traditional digital assets?",
    "What are some of the key security considerations for cryptocurrency investors?",
    "What are the main challenges facing cryptocurrency adoption today?",
    "How can I safely store my cryptocurrencies, and what are the risks associated with different methods?",
    "What are the most popular cryptocurrency exchanges, and what are their pros and cons?",
    "If you could meet any historical figure, who would it be and what would you ask them?",
    "What are some basic strategies for trading cryptocurrencies, and what are the potential risks involved?",
    "What are the key metrics to consider when evaluating a new cryptocurrency project?",
    "What are some of the different ways to invest in cryptocurrency, and which one is right for me?",
    "How are cryptocurrencies regulated in different countries, and what are the implications for investors?",
    "What are the tax implications of owning and trading cryptocurrencies?",
    "How is the cryptocurrency industry evolving, and what are the future trends to watch for?",
    "What are some of the ethical and societal implications of cryptocurrency technology?"
  ]


  const selectRandomly = () => {
    const randomValue = selectRandomOPtions[Math.floor(Math.random() * selectRandomOPtions.length)]
    setValue(randomValue)
  }

  // to fetch the data from the gemini server
  const fetchData = async () => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history: chatHistory,
        message: value
      })
    }

    const response = await fetch("https://gemini-server-main.onrender.com/gemini/send-response", options)
    const result = await response.text()
    return result

  }



  const fetchDataAndHandleTimeout = async () => {
    try {
      const result = await Promise.race([
        fetchData(),
        new Promise((resolve) => setTimeout(resolve, Timeout * 1000))
      ]);
      return result;
    } catch (error) {
      setError("Timeout, please check your internet connection");
      setLoading(false);
    }
  }





  // use to send our query to the server`
  const getResponse = async () => {
    if (!value) {
      setError(" Error: please enter a value")
      return
    }

    try {



      //loading while awaiting response 
      setLoading(true)
      // its use to recieve messages from the server
      data = await fetchDataAndHandleTimeout();


      // Format bot response if needed (adjust this according to your response format)
      const formattedRes = data.split('\\n').map((part, index) => <p key={index}>{part}</p>);

      setChatHistory(oldChatHsitory =>
        [...oldChatHsitory, {
          role: "user",
          parts: value
        },
        {
          role: "Geminoid",
          parts: formattedRes
        }]
      )

      setValue('')
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setError("something went wrong")

    }
  }



  const listenEnter = (e) => {
    if (e.key === "Enter") {
      getResponse()
    }
  }

  // Separate the messages by role
  const userMessages = chatHistory.filter(item => item.role === 'user');
  const geminoidMessages = chatHistory.filter(item => item.role === 'Geminoid');

  // Calculate the minimum length to avoid index out of bounds
  const minLength = Math.min(userMessages.length, geminoidMessages.length);

  // Create an array to hold the interleaved messages
  const interleavedMessages = [];

  // Interleave the messages starting from the last pair
  for (let i = minLength - 1; i >= 0; i--) {
    interleavedMessages.push(userMessages[i], geminoidMessages[i]);
  }

  // Add any remaining messages if one array is longer than the other
  if (userMessages.length > minLength) {
    interleavedMessages.push(...userMessages.slice(0, userMessages.length - minLength).reverse());
  }
  if (geminoidMessages.length > minLength) {
    interleavedMessages.push(...geminoidMessages.slice(0, geminoidMessages.length - minLength).reverse());
  }


  return (
    <div className="app">
      <h1 className='app-title'>LARGE LANGUAGE MODEL CHATBOT</h1>
      <section className='app'>
        <p>
          what do you want to know?
          <button className='suprise-me' onClick={selectRandomly} disabled={!chatHistory || loading}> Get a random crypto fact👍 </button>
        </p>



        <div className='search-container'>
          <input value={value} placeholder='Ask me any crypto related question' onKeyDown={listenEnter} onChange={e => setValue(e.target.value)}></input>
          {!error && <button className='search-button' onClick={getResponse}>Search</button>}
          {error && <button className='search-button' onClick={clear}>clear</button>
          }

        </div>
        <p>{error}</p>

        

        <div className='search-result'>
          
           {loading && (
            <div className='Answer'>
              <div class="spinner"></div>

              </div>
          
          )}
          
          {interleavedMessages.map((chatItem, index) => (
        <div className='Answer' key={index}>
          <p>
            {chatItem.role} : {Array.isArray(chatItem.parts) 
              ? chatItem.parts.map((part, idx) => (
                  <span key={idx}>{typeof part === 'object' ? part : part.toString()}</span>
                ))
              : chatItem.parts}
          </p>
        </div>
      ))}

         

        </div>
      </section>

    </div>
  );

}

export default App;
