import { createStore, applyMiddleware, compose } from "redux";
import reducer from "./reducers";
import { fireAuth } from "../firebase/init";
import { setCurrentUser } from "./actions/user";
import thunk from "redux-thunk";
import { fetchUserNotesFromFirestore } from "../firebase/notes";
import { fetchUserNotes } from "./actions/notes";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const makeStore = () => {
    const store = createStore(
        reducer, 
        composeEnhancers(
            applyMiddleware(thunk)
        )
    )

    // Set an observer on the Auth object
    fireAuth.onAuthStateChanged((user) => {
        if (user) {
            // User is logged in
            store.dispatch(setCurrentUser(user.toJSON()))

            // Set an observer on the user's notes
            fetchUserNotesFromFirestore(user.uid)
                .onSnapshot(snapshot => {
                        const notes = snapshot.docs.map(note => buildNoteObject(note))
                        store.dispatch(fetchUserNotes(notes))
                    }
                    // onSnapshot throws a permissions error if the user has signed out.
                    // Catch this error, then Firebase will automatically unsubscribe
                    // the onSnapshot listener.
                    // https://firebase.google.com/docs/firestore/query-data/listen#handle_listen_errors
                    ,() => {}
                )
        } else {
            // User is not logged in
            store.dispatch(setCurrentUser(null))
            store.dispatch(fetchUserNotes(null))
        }
    })

    return store
}

const buildNoteObject = (noteDocument) => {
    const data = noteDocument.data()
    const id = noteDocument.id

    return {
        id,
        ...data
    }
}