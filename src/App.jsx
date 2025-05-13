import { Layout, Tabs } from 'antd';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Header from './components/Header';
import './App.css';

const { Content } = Layout;

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
      <Header />
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