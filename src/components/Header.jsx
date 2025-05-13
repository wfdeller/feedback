import { Layout, Typography } from 'antd';
import FormattedUsername from './FormattedUsername';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

function Header() {
  return (
    <AntHeader className="header" style={{ width: '100%' }}>
      <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>Feedback Portal</Title>
        <FormattedUsername />
      </div>
    </AntHeader>
  );
}

export default Header;