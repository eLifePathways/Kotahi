/* eslint react/prop-types: 0 */
import Editor from './Editor'

export default ({ notes, view }) => {
  return (
    <>
      {notes.map(note => (
        <Editor key={note.node.attrs.id} node={note.node} view={view} />
      ))}
    </>
  )
}
