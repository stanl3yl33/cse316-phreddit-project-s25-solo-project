function ConfirmScreen({ msg, onConfirm, onDeny }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p>{msg}</p>
        <div className="confirm-buttons">
          <button onClick={() => onConfirm()}>Yes</button>
          <button onClick={() => onDeny()}>No</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmScreen;
