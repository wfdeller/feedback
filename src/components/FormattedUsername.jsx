import { Typography } from 'antd';

const { Text } = Typography;

function FormattedUsername() {
  // This would typically come from auth context or store
  const username = "John Doe";
  
  return (
    <Text style={{ color: 'white' }}>
      {username}
    </Text>
  );
}

export default FormattedUsername;