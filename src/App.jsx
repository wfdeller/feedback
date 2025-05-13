import { Layout, Typography, Tabs } from 'antd';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  // These would typically come from your app state or URL parameters
  const userId = "user123";
  const applicationId = "app456";

  const items = [
    {
      key: '1',
      label: 'Submit Feedback',
      children: <FeedbackForm userId={userId} applicationId={applicationId} />
    },
    {
      key: '2',
      label: 'View Feedback',
      children: <FeedbackList userId={userId} applicationId={applicationId} />
    }
  ];

  return (
    <Layout className="layout">
      <Header className="header" style={{ width: '100%' }}>
        <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>Feedback Portal</Title>
        </div>
      </Header>
      <Content className="content">
        <div className="container">
          <Tabs 
            defaultActiveKey="1" 
            items={items} 
            style={{ width: '100%' }}
            tabBarStyle={{ 
              marginBottom: 0, 
              padding: '0 16px',
              borderBottom: '1px solid #f0f0f0'
            }}
            size="large"
          />
        </div>
      </Content>
    </Layout>
  );
}

export default App;