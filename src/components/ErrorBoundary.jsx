import { Component } from 'react';
import { Result, Button } from 'antd';

export default class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught:', error, errorInfo);
    }

    render() {
        if(this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Something went wrong"
                    subTitle={this.state.error?.message}
                    extra={
                        <Button
                            type="primary"
                            onClick={() => {
                                this.setState({ hasError: false });
                                window.location.reload();
                            }}
                        >
                            Reload Page
                        </Button>
                    }
                />
            );
        }
        return this.props.children;
    }
}