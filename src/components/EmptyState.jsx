import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function EmptyState({
                                       title,
                                       description,
                                       actionText,
                                       onAction
                                   }) {
    return (
        <Empty
            description={
                <span>
                    <strong>{title}</strong>
                    <br />
                    <span style={{ color: '#999' }}>{description}</span>
                </span>
            }
        >
            {onAction && (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onAction}
                >
                    {actionText}
                </Button>
            )}
        </Empty>
    );
}