import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  sceneName?: string;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8 max-w-sm"
          >
            <div className="text-6xl mb-4">🤖</div>
            <div className="text-2xl text-white font-bold mb-2" style={{ fontFamily: 'Fredoka One, cursive' }}>
              Vimo needs a better device!
            </div>
            <div className="text-white/60 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
              This scene requires WebGL. Please try on a device with a modern browser and GPU support.
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
