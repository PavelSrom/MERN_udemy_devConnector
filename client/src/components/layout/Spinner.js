import React from 'react'

const Spinner = () => {
  const spinnerStyle = {
    display: 'flex',
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 10,
    opacity: 0.5
  }

  return (
    <div style={spinnerStyle}>
      <p
        style={{
          margin: 'auto',
          color: '#fff',
          fontSize: '24px'
        }}
      >
        Loading...
      </p>
    </div>
  )
}

export default Spinner
