import configProvider from '../config';

describe('config', () => {
  test('returns objects for partial paths', () => {
    const config = configProvider({ default: { child: 'val' } });
    expect(config.get('default')).toEqual({ child: 'val' });
  });
  test('supports full paths', () => {
    const config = configProvider({ default: { child: 'val' } });
    expect(config.get('default.child')).toEqual('val');
  });
  test('accepts initial values', () => {
    const config = configProvider({ default: 'val', foo: 'bar' });
    expect(config.get('default')).toEqual('val');
    expect(config.get('foo')).toEqual('bar');
  });
  test('accepts uid in paths', () => {
    const config = configProvider({
      'api::myapi': { foo: 'val' },
      'plugin::myplugin': { foo: 'bar' },
    });

    expect(config.get('api::myapi.foo')).toEqual('val');
    expect(config.get('api::myapi')).toEqual({ foo: 'val' });
    expect(config.get('plugin::myplugin.foo')).toEqual('bar');
    expect(config.get('plugin::myplugin')).toEqual({ foo: 'bar' });
  });
  test('supports deprecation for plugin.', () => {
    const config = configProvider({
      'plugin::myplugin': { foo: 'bar' },
    });

    expect(config.get('plugin.myplugin.foo')).toEqual('bar');
    expect(config.get('plugin.myplugin')).toEqual({ foo: 'bar' });
  });
  test('does NOT support deprecation for other prefixes', () => {
    const config = configProvider({
      'api::myapi': { foo: 'bar' },
    });

    expect(config.get('api.myapi')).toEqual(undefined);
  });
});
