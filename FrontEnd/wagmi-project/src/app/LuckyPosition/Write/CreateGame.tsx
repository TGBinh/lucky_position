"use client";

import React, { useState } from 'react';
import { publicClient, walletClient } from '../../../client';
import { contract } from '../LuckyPositionAbi';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import './Function.css';

const CreateGame = () => {
  const [ticketPrice, setTicketPrice] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const account = useAccount();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    if (!ticketPrice || !duration) {
      setErrorMessage('Please enter Ticket Price and Duration');
      return;
    }
    try {
      const price = BigInt(ticketPrice);
      const durationVal = BigInt(duration);

      const { request } = await publicClient.simulateContract({
        abi: contract.abi,
        address: contract.address as Address,
        functionName: 'createGame',
        args: [price, durationVal],
        account: account.address as Address,
      });

      const hash = await walletClient.writeContract(request);
      console.log('Transaction hash:', hash);
    } catch (error: any) {
      console.error('Error calling createGame:', error);
      setErrorMessage(error.message || 'An error occurred while creating game');
    }
  };

  return (
    <div className="form-container">
      <h2>Create Game</h2>
      <form onSubmit={submit}>
        <div className="input-container">
          <label htmlFor="ticketPrice">Ticket Price</label>
          <input 
            type="number" 
            id="ticketPrice" 
            name="ticketPrice" 
            value={ticketPrice} 
            onChange={(e) => setTicketPrice(e.target.value)} 
          />
        </div>
        <div className="input-container">
          <label htmlFor="duration">Duration (in seconds)</label>
          <input 
            type="number" 
            id="duration" 
            name="duration" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
          />
        </div>
        <button type="submit" className="submit-button">
          Create Game
        </button>
        {errorMessage && (
          <div style={{ color: "red", marginTop: "8px", fontSize: "0.9rem" }}>
            {errorMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateGame;
