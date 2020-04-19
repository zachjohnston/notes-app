import React from 'react';

function NoteList(props) {

    const {notes} = props
    
    return (
        <ul>
            {notes.map(note => (
                <li key={note.id}>
                    {note.subject}
                </li>
            ))}
        </ul>
    )
}

export default NoteList;