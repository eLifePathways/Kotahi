/* eslint-disable react/prop-types */

const ColorPicker = ({ onChange, required, value, displayValue = true }) => {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        position: 'relative',
        gap: '1rem',
        width: 'fit-content',
      }}
    >
      <input
        onChange={event => onChange(event.target.value)}
        required={required}
        style={{
          position: 'absolute',
          cursor: 'pointer',
          opacity: 0,
          zIndex: 2,
          width: '100%',
        }}
        type="color"
        value={value}
      />
      <div
        className="form-control"
        style={{
          zIndex: 1,
          width: '30px',
          height: '30px',
          outline: `${value}44 1px solid`,
          outlineOffset: '2px',
          backgroundColor: value,
          borderRadius: '50%',
          boxShadow: 'inset 0 0 5px #0003, 0 0 5px #0002',
        }}
      />{' '}
      {displayValue && (
        <p
          style={{
            fontSize: '14px',
            margin: '0',
            color: value,
            border: `1px solid ${value}`,
            borderRadius: '10px',
            lineHeight: 1,
            padding: '3px 10px',
            zIndex: 1,
          }}
        >
          {value}
        </p>
      )}
    </div>
  )
}

export default ColorPicker
