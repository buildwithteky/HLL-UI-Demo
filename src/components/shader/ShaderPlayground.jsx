// ShaderPlayground — fullscreen <Shader> with the unrestricted live control panel.
import Shader from './Shader.jsx';

export default function ShaderPlayground({ variant = 'services' }) {
  return <Shader variant={variant} controls />;
}
