import '../../styles/data-display.css';
import ExcelGrid from '../ExcelGrid';

function UserDataSection({ statusText, errorMessage, userRows }) {
  return (
    <div className="table-area">
      <p className={errorMessage ? 'status-text error' : 'status-text'}>{statusText}</p>
      <ExcelGrid rows={userRows} />
    </div>
  );
}

export default UserDataSection;
