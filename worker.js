export default {
  async fetch(request, env, ctx) {
    console.log(env);
    return env.ASSETS.fetch(request);
  }
};