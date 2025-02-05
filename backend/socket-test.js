const { io } = require('socket.io-client');
const readlineSync = require('readline-sync');
const axios = require('axios');

const API_URL = 'http://localhost:3000';
let socket = null;
let token = null;

async function login() {
  const email = readlineSync.question('Email: ');
  const password = readlineSync.question('Password: ', { hideEchoBack: true });

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    token = response.data.access_token;
    console.log('Login successful!');
    
    // Initialize socket connection with the token
    socket = io(API_URL, {
      auth: {
        token: token
      }
    });

    // Handle socket connection events
    socket.on('connect', () => {
      console.log('Socket connected!');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('exception', (error) => {
      console.error('Socket error:', error.message);
    });

    return new Promise((resolve) => {
      socket.on('connect', () => {
        resolve(true);
      });
      
      socket.on('connect_error', () => {
        resolve(false);
      });
    });
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function readAllCats() {
  return new Promise((resolve) => {
    socket.emit('read_all_cats', null, (response) => {
      if (response.data) {
        console.log('\nAll cats:');
        response.data.forEach(cat => {
          console.log(`ID: ${cat.id}, Name: ${cat.name}, Age: ${cat.age}, Breed: ${cat.breed || 'N/A'}`);
        });
      } else {
        console.log('Error reading cats:', response.error || 'Unknown error');
      }
      resolve();
    });
  });
}

async function addCat() {
  const name = readlineSync.question('Cat name: ');
  const age = parseInt(readlineSync.question('Cat age: '));
  const breed = readlineSync.question('Cat breed (optional): ');

  return new Promise((resolve) => {
    const catData = { name, age, ...(breed && { breed }) };
    socket.emit('add_cat', catData, (response) => {
      if (response.data) {
        console.log('\nCat added successfully:', response.data);
      } else {
        console.log('Error adding cat:', response.error || 'Unknown error');
      }
      resolve();
    });
  });
}

async function updateCat() {
  const id = parseInt(readlineSync.question('Cat ID to update: '));
  const name = readlineSync.question('New name (press Enter to skip): ');
  const ageStr = readlineSync.question('New age (press Enter to skip): ');
  const breed = readlineSync.question('New breed (press Enter to skip): ');

  const updateData = {};
  if (name) updateData.name = name;
  if (ageStr) updateData.age = parseInt(ageStr);
  if (breed) updateData.breed = breed;

  return new Promise((resolve) => {
    const data = { id, updateCatDto: updateData };
    socket.emit('update_cat', data, (response) => {
      if (response.data) {
        console.log('\nCat updated successfully:', response.data);
      } else {
        console.log('Error updating cat:', response.error || 'Unknown error');
      }
      resolve();
    });
  });
}

async function removeCat() {
  const id = parseInt(readlineSync.question('Cat ID to remove: '));

  return new Promise((resolve) => {
    socket.emit('remove_cat', id, (response) => {
      if (response.data) {
        console.log('\nCat removed successfully:', response.data);
      } else {
        console.log('Error removing cat:', response.error || 'Unknown error');
      }
      resolve();
    });
  });
}

async function main() {
  console.log('Welcome to Cat WebSocket Test Client!\n');
  
  if (!await login()) {
    return;
  }

  while (true) {
    console.log('\nAvailable actions:');
    console.log('1. Read all cats');
    console.log('2. Add cat');
    console.log('3. Update cat');
    console.log('4. Remove cat');
    console.log('5. Exit');

    const choice = readlineSync.question('\nChoose an action (1-5): ');

    switch (choice) {
      case '1':
        await readAllCats();
        break;
      case '2':
        await addCat();
        break;
      case '3':
        await updateCat();
        break;
      case '4':
        await removeCat();
        break;
      case '5':
        console.log('Goodbye!');
        if (socket) {
          socket.disconnect();
        }
        return;
      default:
        console.log('Invalid choice. Please try again.');
    }
  }
}

main().catch(console.error); 