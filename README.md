
# Text Annotator

Text Annotator system, can be integrated into TypeScript web appications.

Follow the `Install and run` guide to run the system without integrating it into an application.

Follow the `Integration` guide to integrate the system into your Typescript web application.

## Install and run

Inside `text-annotator-server`'s folder, run:

```bash
  npm install
  npm audit fix
  npm start
```

Inside `text-annotator-client`'s folder, run:

```bash
  npm install
  npm audit fix
  npm start
```

## Integration

#### Server

- Copy the following dependencies in your server's package.json file:

    ```bash
    "devDependencies": {
        "@types/cors": "^2.8.17",
        "@types/express": "^5.0.0",
        "@types/node": "^22.7.3",
        "express": "^4.21.0",
        "ts-node": "^10.9.2",
        "typescript": "^5.6.2"
    },
    "dependencies": {
        "@types/uuid": "^10.0.0",
        "cors": "^2.8.5",
        "jsdom": "^25.0.1",
        "uuid": "^10.0.0"
    }
    ```

    then run:

    ```bash
    npm install
    npm audit fix
    ```

- Copy the `models` folder in your server's `src` folder.

- Integrate the endpoints from the `index.ts` file:
    - app.get('/annotator/books', ...
    - app.get('/annotator/:bookID', ...
    - app.post('/annotator/', ...
    - app.put('/annotator/:id', ...
    - app.delete('/annotator/:id', ...
    - app.delete('/annotator/session/:userID/:bookID', ...

- Your texts have to be inserted in a `Book` array like so:
    ```bash
    let books: Book[] = [
        {id: uuidv4(), title: title1, content: book1},
        {id: uuidv4(), title: title2, content: book2},
        {id: uuidv4(), title: title3, content: book3}
    ];
    ```
    Every `Book` object has to contain:
    - id: string ID of the text.
    - title: string title of the text.
    - content: string containing the HTML code of the text.

- Your notes will be save inside a `Note` array:
    ```bash 
    let notes: Note[] = [];
    ```

#### Client

- Copy the following dependencies in your client's package.json file:

    ```bash
    "dependencies": {
        "@recogito/recogito-js": "^1.8.4",
        "@testing-library/jest-dom": "^5.17.0",
        "@testing-library/react": "^13.4.0",
        "@testing-library/user-event": "^13.5.0",
        "@types/jest": "^27.5.2",
        "@types/node": "^16.18.108",
        "@types/react": "^18.3.6",
        "@types/react-dom": "^18.3.0",
        "ajv": "^8.17.1",
        "ajv-keywords": "^5.1.0",
        "axios": "^1.7.7",
        "buffer": "^6.0.3",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-html-parser": "^2.0.2",
        "react-scripts": "5.0.1",
        "typescript": "^4.9.5",
        "uuid": "^11.0.3",
        "web-vitals": "^2.1.4"
    },
    ```

    then run:

    ```bash
    npm install
    npm audit fix
    ```

- Copy the following files in your client's `src` folder:
    - Cartella src:
        - Cartella components:
            - cartella annotatorViews: 
                - BookView.tsx 
                - NotesView.tsx
            - cartella pop-ups: 
                - Modal.tsx
                - Warning.tsx 
            - TextAnnotator.tsx
        - Cartella css:
            - app.css
            - bookView.css 
            - modal.css
            - notesView.css 
            - warning.css
        - Cartella images:
            - blank-profile-picture.png
        - types.d.ts

- Render the Text Annotator main component (`TextAnnotator.tsx`) by providing it the following parameters as props:
    - bookID, stringa ID of the text that you want to annotate. 
    - title, tringa title of the text that you want to annotate.
    - bookContent: string containing the HTML code of the text that you want to annotate.
    - userID: string ID of the currently logged in user. 
    - username: string unsername of the currently logged in user.
    - renderPage: function that closes Text Annotator to go back to the previous page.
## Authors

- [@marcodalpian](https://github.com/marcodalpian)

