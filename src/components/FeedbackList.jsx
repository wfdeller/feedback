import { useEffect, useState } from 'react';
import { Table, Tag, Typography, Card, Space, Button, Tooltip } from 'antd';
import { ReloadOutlined, EditOutlined, MailOutlined } from '@ant-design/icons';
import FeedbackStatusUpdate from './FeedbackStatusUpdate';
import useFeedbackStore from '../store/feedbackStore';

const { Title } = Typography;

const FeedbackList = ({ userId, applicationId }) => {
    // Use individual selectors to prevent infinite loops
    const feedbacks = useFeedbackStore('feedbacks');
    const loading = useFeedbackStore('loading');
    const getFeedbackRequests = useFeedbackStore((state) => state.getFeedbackRequests);
    
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);

    useEffect(() => {
        loadFeedbacks();
    }, [userId, applicationId]);
    
    const showStatusModal = (feedback) => {
        setSelectedFeedback(feedback);
        setStatusModalVisible(true);
    };
    
    const closeStatusModal = () => {
        setStatusModalVisible(false);
        loadFeedbacks(); // Refresh the list after status update
    };

    const loadFeedbacks = () => {
        getFeedbackRequests(userId, applicationId);
    };

    const getPriorityColor = (priority) => {
        const colors = {
            Low: 'green',
            Medium: 'blue',
            High: 'red',
        };
        return colors[priority] || 'blue';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Submitted By',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <span>{record.userName || `User ${record.userId}`}</span>
                    {record.userEmail && (
                        <Tooltip title={record.userEmail}>
                            <MailOutlined style={{ color: '#1890ff' }} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'feedbackStatus',
            key: 'feedbackStatus',
            render: (status) => {
                const color = status === 'Open' ? 'blue' : 
                             status === 'In Progress' ? 'orange' :
                             status === 'Resolved' ? 'green' : 'gray';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Submitted Date',
            dataIndex: 'submittedDate',
            key: 'submittedDate',
            render: (date) => formatDate(date),
        },
        {
            title: 'Latest Update',
            dataIndex: 'status',
            key: 'status',
            render: (statusArray) => {
                if (!statusArray || statusArray.length === 0) return 'No updates';
                const latestStatus = statusArray[statusArray.length - 1];
                return (
                    <span>
                        {latestStatus.description} ({formatDate(latestStatus.statusDate)})
                    </span>
                );
            },
        },
        {
            title: 'Jira Ticket',
            dataIndex: 'jiraTicketId',
            key: 'jiraTicketId',
            render: (ticketId) => ticketId || 'Not created yet',
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={() => showStatusModal(record)}
                >
                    Update
                </Button>
            ),
        },
    ];

    return (
        <Card className='feedback-list' style={{ width: '100%', border: 'none', borderRadius: 0 }}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={3}>Your Feedback Requests</Title>
                    <Button type='primary' icon={<ReloadOutlined />} onClick={loadFeedbacks} loading={loading}>
                        Refresh
                    </Button>
                </div>

                <Table
                    dataSource={feedbacks}
                    columns={columns}
                    rowKey='_id'
                    loading={loading}
                    style={{ width: '100%' }}
                    pagination={{ pageSize: 10 }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <p style={{ margin: 0, padding: '16px' }}>
                                <strong>Description:</strong> {record.description}
                            </p>
                        ),
                    }}
                />
                
                {selectedFeedback && (
                    <FeedbackStatusUpdate 
                        feedback={selectedFeedback}
                        visible={statusModalVisible}
                        onClose={closeStatusModal}
                    />
                )}
            </Space>
        </Card>
    );
};

export default FeedbackList;
