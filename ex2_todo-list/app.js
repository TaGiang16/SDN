import readline from 'readline';
import TodoList from './TodoList.js';
import TodoItem from './TodoItem.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const todoList = new TodoList();

const askQuestion = (query) =>
  new Promise((resolve) => {
    rl.question(query, (answer) => resolve(answer));
  });

async function addNewItem() {
  const title = (await askQuestion('Enter the title of the new todo item: ')).trim();

  if (!title) {
    console.log('Title cannot be empty.\n');
    return;
  }

  const item = new TodoItem(title);
  todoList.addItem(item);
  console.log('Added new item successfully.\n');
}

async function markItemCompleted() {
  const indexInput = await askQuestion('Enter the index of the item you wish to mark as completed: ');
  const index = Number.parseInt(indexInput, 10) - 1;

  if (index >= 0 && index < todoList.items.length) {
    const success = todoList.completeItem(index);
    if (success) {
      console.log('Item marked as completed successfully.\n');
    }
  } else {
    console.log('Invalid item index.\n');
  }
}

async function main() {
  let running = true;

  while (running) {
    console.log('1. Add a new todo item');
    console.log('2. Display all todo items with their status');
    console.log('3. Mark an item as completed');
    console.log('4. Exit');

    const choice = (await askQuestion('Choose an action: ')).trim();

    switch (choice) {
      case '1':
        await addNewItem();
        break;
      case '2':
        if (todoList.items.length === 0) {
          console.log('No todo items yet.\n');
        } else {
          todoList.displayItemsWithStatus();
          console.log('');
        }
        break;
      case '3':
        if (todoList.items.length === 0) {
          console.log('No items to complete.\n');
        } else {
          await markItemCompleted();
        }
        break;
      case '4':
        running = false;
        console.log('Exiting...');
        break;
      default:
        console.log('Invalid choice, please try again.\n');
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
});
