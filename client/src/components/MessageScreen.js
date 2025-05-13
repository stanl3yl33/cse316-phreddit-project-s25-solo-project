function MessageScreen({ msg, onConfirm }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p>{msg}</p>
        <div className="confirm-buttons">
          <button onClick={() => onConfirm()}>Ok</button>
        </div>
      </div>
    </div>
  );
}

export default MessageScreen;
