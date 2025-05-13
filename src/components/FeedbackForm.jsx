import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Typography, Card, Alert, Space, Spin } from 'antd';
import useFeedbackStore from '../store/feedbackStore';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const FeedbackForm = ({ userId, applicationId }) => {
    // Use individual selectors to prevent infinite loops
    const loading = useFeedbackStore('loading');
    const error = useFeedbackStore('error');
    const message = useFeedbackStore('message');
    const formState = useFeedbackStore('formState');
    const updateFormField = useFeedbackStore((state) => state.updateFormField);
    const resetForm = useFeedbackStore((state) => state.resetForm);
    const submitFeedbackRequest = useFeedbackStore((state) => state.submitFeedbackRequest);
    
    // State for storing user information
    const [userInfo, setUserInfo] = useState({ 
        userName: null, 
        email: null,
        loading: true 
    });
    
    // Fetch user information on component mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!userId) return;
            
            try {
                // Use our API endpoint that proxies the WebTeleService
                const response = await axios.get(`/api/user-info/${userId}`);
                setUserInfo({ 
                    userName: response.data.userName,
                    email: response.data.email,
                    loading: false 
                });
            } catch (error) {
                console.log('Error fetching user info:', error);
                setUserInfo({ 
                    userName: null,
                    email: null,
                    loading: false 
                });
            }
        };
        
        fetchUserInfo();
    }, [userId]);

    const [form] = Form.useForm();

    // Reset form when message appears (successful submission)
    useEffect(() => {
        if (message) {
            form.resetFields();
        }
    }, [message, form]);

    const handleFinish = async (values) => {
        await submitFeedbackRequest(userId, applicationId);
    };

    const handleValuesChange = (changedValues) => {
        const field = Object.keys(changedValues)[0];
        const value = changedValues[field];
        updateFormField(field, value);
    };

    return (
        <Card className='feedback-form' style={{ width: '100%', border: 'none', borderRadius: 0 }}>
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                <div>
                    <Title level={3}>Feedback Request</Title>
                    <Text type='secondary'>
                        {userInfo.loading ? (
                            <span>Loading user info... <Spin size="small" /></span>
                        ) : userInfo.userName ? (
                            <div>
                                <div>User: {userInfo.userName} ({userId})</div>
                                {userInfo.email && <div>Email: {userInfo.email}</div>}
                                <div>Application ID: {applicationId}</div>
                            </div>
                        ) : (
                            <span>User ID: {userId} | Application ID: {applicationId}</span>
                        )}
                    </Text>
                </div>

                {message && (
                    <Alert
                        message='Success'
                        description={message}
                        type='success'
                        showIcon
                        closable
                        onClose={() => resetForm()}
                    />
                )}

                {error && (
                    <Alert
                        message='Error'
                        description={error}
                        type='error'
                        showIcon
                        closable
                        onClose={() => resetForm()}
                    />
                )}

                <Form
                    form={form}
                    layout='vertical'
                    onFinish={handleFinish}
                    onValuesChange={handleValuesChange}
                    initialValues={{
                        title: formState.title,
                        description: formState.description,
                        priority: formState.priority,
                    }}
                >
                    <Form.Item name='title' label='Title' rules={[{ required: true, message: 'Please enter a title' }]}>
                        <Input placeholder='Enter the feedback title' />
                    </Form.Item>

                    <Form.Item
                        name='description'
                        label='Description'
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <TextArea placeholder='Describe the feedback request in detail' rows={5} />
                    </Form.Item>

                    <Form.Item name='priority' label='Priority'>
                        <Select>
                            <Option value='Low'>Low</Option>
                            <Option value='Medium'>Medium</Option>
                            <Option value='High'>High</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type='primary' htmlType='submit' loading={loading} block>
                            Submit Request
                        </Button>
                    </Form.Item>
                </Form>
            </Space>
        </Card>
    );
};

export default FeedbackForm;
