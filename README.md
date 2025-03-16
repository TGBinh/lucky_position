# Lucky Position
## Introduction
Welcome to **Lucky Position**, an decentralized game built on blockchain technology. In this game, users can stake tokens to participate and experience the thrill of chance. At the end of each game, a Verifiable Random Function (VRF) is used to randomly determine the outcome, ensuring fairness and transparency. The outcome will then trigger the transition to a new game, offering users the chance to continue their journey with different challenges and rewards. 

![LuckyPosition](https://i.imgur.com/dQTCd4v.png)

## Key Features
- **Token-Based Entry**: Users can join the game by staking tokens, integrating blockchain assets into the gaming experience.
- **VRF Integration**: Utilizes VRF to ensure fair and transparent randomization of game outcomes and winner selection.
- **Automated Game Transitions**: Once a game concludes, the outcome triggers an automatic transition to the next game, allowing users to seamlessly continue their journey.
- **Game Pause and Resume**: he game includes a pause and resume feature, allowing the game to be paused for a specified period and later resumed.
- **Fair and Transparent Payouts:**: Using blockchain technology, payouts are automatically and transparently distributed, ensuring fair compensation for winners.
## Technology Stack
- **Smart Contracts**: Built on the Ethereum blockchain using Solidity.
- **Hardhat**: Development environment for writing and testing smart contracts.
- **Chainlink VRF**: Provides provably fair randomization for game outcomes, ensuring transparency and fairness by generating verifiable randomness.
- **ChainLink Automation**:  Used to automate game transitions, ensuring seamless progression between game stages without manual intervention.
- **Upgradeable UUPS**: Ensuring that the game can evolve with new features and improvements over time without disrupting the user experience. 
- **DateTime Contract**: This is a smart contract used to convert and check times, such as hours, minutes and seconds, from a Unix timestamp.
- **Pausable Feature**: Use the OpenZeppelin library to add pause functionality to contracts, allowing functions to be stopped when needed.
- **Subsquid Indexer**: Provides a solution for indexing and processing blockchain data in real time, ensuring that up-to-date information is available for querying and analytics.
- **React**: Frontend framework for user interface and interaction.
- **Wagmi**: React hooks library for Ethereum, used for blockchain interactions.

## Usage
#### Create Game
- Input the ticket price (amount required to participate) and the game duration (time until the game ends).
- Ensure that the allowed token is available in your wallet for participation.
#### Join Game
- Approve and deposit the required token amount as the ticket price.
- Once your participation is confirmed, the system will update your status as a participant.
#### Pause/Resume Game
- Admins can pause or resume any active game.
- The game will be automatically paused or resumed at the pre-set time using Chainlink Automation to ensure smooth operation.
#### End Game & Award Winner
- After the game duration ends, the system will request a random number from Chainlink VRF to select the winner.
- The winner is determined based on the random number generated, and the prize is automatically distributed.
  
## License
This project is licensed under the MIT License. See the LICENSE file for details.
## Contact
For any questions, feel free to reach out:

Email: [truonggiabinh1231@gmail.com](truonggiabinh1231@gmail.com)

GitHub: [https://github.com/TGBinh](https://github.com/TGBinh)
