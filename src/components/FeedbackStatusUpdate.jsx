import { useState } from 'react';
import { Modal, Form, Select, Button, Input, Typography, Space, Tag } from 'antd';
import useFeedbackStore from '../store/feedbackStore';

const { Option } = Select;
const { Text } = Typography;

const FeedbackStatusUpdate = ({ feedback, visible, onClose }) => {
  const [form] = Form.useForm();
  const loading = useFeedbackStore('loading');
  const updateFeedbackStatus = useFeedbackStore((state) => state.updateFeedbackStatus);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Helper function to get color for status tags
  const getStatusColor = (status) => {
    const colors = {
      'Open': 'blue',
      'In Progress': 'orange',
      'Resolved': 'green',
      'Closed': 'gray'
    };
    return colors[status] || 'blue';
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const customStatus = values.customStatus 
        ? `${selectedStatus}: ${values.customStatus}`
        : selectedStatus;
        
      await updateFeedbackStatus(feedback._id, customStatus);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Modal
      title="Update Feedback Status"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: '100%', marginBottom: 20 }}>
        <div>
          <Text strong>Submitted By:</Text>{' '}
          <Text>{feedback.userName || `User ${feedback.userId}`}</Text>
          {feedback.userEmail && (
            <div style={{ marginTop: 4 }}>
              <Text strong>Email:</Text>{' '}
              <Text>{feedback.userEmail}</Text>
            </div>
          )}
        </div>
        <div>
          <Text strong>Current Status:</Text>{' '}
          <Tag color={getStatusColor(feedback.feedbackStatus)}>
            {feedback.feedbackStatus}
          </Tag>
        </div>
        
        {feedback.jiraTicketId && (
          <div>
            <Text strong>Jira Ticket:</Text>{' '}
            <Text code>{feedback.jiraTicketId}</Text>
          </div>
        )}
        
        <div>
          <Text strong>Status History:</Text>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            {feedback.status.map((status, index) => (
              <li key={index}>
                <Text type="secondary">
                  {new Date(status.statusDate).toLocaleString()}:
                </Text>{' '}
                <Text>{status.description}</Text>
              </li>
            ))}
          </ul>
        </div>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: 'In Progress' }}
      >
        <Form.Item
          name="status"
          label="New Status"
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select onChange={handleStatusChange}>
            <Option value="In Progress">In Progress</Option>
            <Option value="Resolved">Resolved</Option>
            <Option value="Closed">Closed</Option>
            <Option value="Custom">Custom Status</Option>
          </Select>
        </Form.Item>
        
        {selectedStatus === 'Custom' && (
          <Form.Item
            name="customStatus"
            label="Custom Status Details"
            rules={[{ required: true, message: 'Please enter status details' }]}
          >
            <Input placeholder="Enter custom status details" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Update Status
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FeedbackStatusUpdate;