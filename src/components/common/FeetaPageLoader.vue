<template>
  <Transition name="feeta-loader">
    <div v-if="loading.isLoading" class="loader-shell" role="status" aria-live="polite" aria-label="FEETA Admin is loading">
      <div class="loader-card">
        <div class="loader-glow" aria-hidden="true"></div>
        <div class="brand-lockup">
          <div class="brand-mark" aria-hidden="true">
            <span class="brand-pulse"></span>
            <img :src="branding.icon" alt="" />
          </div>
          <!-- <img :src="branding.logo" :alt="`${branding.appName} logo`" class="brand-logo" /> -->
        </div>
        <div class="loader-copy">
          <p>{{ loading.message }}</p>
          <span>Please wait a moment</span>
        </div>
        <div class="progress-track" aria-hidden="true"><span></span></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import branding from '@/config/branding'
import { useLoadingStore } from '@/stores/loading'

const loading = useLoadingStore()
</script>

<style scoped>
.loader-shell{position:fixed;inset:0;z-index:1090;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 22% 18%,rgba(72,127,255,.15),transparent 31%),radial-gradient(circle at 78% 78%,rgba(37,99,235,.1),transparent 29%),rgba(248,250,252,.5);-webkit-backdrop-filter:blur(16px) saturate(140%);backdrop-filter:blur(16px) saturate(140%)}.loader-card{position:relative;width:min(90vw,310px);overflow:hidden;padding:24px;border:1px solid rgba(255,255,255,.78);border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.88),rgba(248,250,252,.67));box-shadow:0 24px 70px rgba(15,23,42,.16),inset 0 1px rgba(255,255,255,.9)}.loader-glow{position:absolute;top:-70px;left:50%;width:180px;height:130px;border-radius:50%;background:rgba(72,127,255,.2);filter:blur(36px);transform:translateX(-50%);animation:glow 2.1s ease-in-out infinite}.brand-lockup{position:relative;display:flex;align-items:center;justify-content:center;gap:12px}.brand-mark{position:relative;width:50px;height:50px;display:grid;place-items:center;flex:0 0 50px;border:1px solid rgba(72,127,255,.18);border-radius:15px;background:rgba(255,255,255,.72);box-shadow:0 8px 22px rgba(72,127,255,.14)}.brand-mark img{position:relative;width:34px;height:34px;object-fit:contain;animation:logo 1.7s ease-in-out infinite}.brand-pulse{position:absolute;inset:4px;border-radius:12px;background:rgba(72,127,255,.14);animation:pulse 1.7s ease-out infinite}.brand-logo{width:112px;max-height:36px;object-fit:contain}.loader-copy{position:relative;margin:18px 0 16px;text-align:center}.loader-copy p{margin:0;color:#1e293b;font-size:13px;font-weight:750;letter-spacing:.01em}.loader-copy span{display:block;margin-top:4px;color:#64748b;font-size:11px}.progress-track{position:relative;height:3px;overflow:hidden;border-radius:999px;background:rgba(148,163,184,.18)}.progress-track span{position:absolute;inset:0;width:42%;border-radius:inherit;background:linear-gradient(90deg,#315ed1,#6ea0ff,#315ed1);box-shadow:0 0 12px rgba(72,127,255,.45);animation:progress 1.15s ease-in-out infinite}.feeta-loader-enter-active,.feeta-loader-leave-active{transition:opacity .2s ease}.feeta-loader-enter-active .loader-card,.feeta-loader-leave-active .loader-card{transition:transform .2s ease,opacity .2s ease}.feeta-loader-enter-from,.feeta-loader-leave-to{opacity:0}.feeta-loader-enter-from .loader-card,.feeta-loader-leave-to .loader-card{opacity:0;transform:translateY(6px) scale(.98)}@keyframes progress{0%{transform:translateX(-110%)}100%{transform:translateX(345%)}}@keyframes pulse{0%{transform:scale(.78);opacity:.8}100%{transform:scale(1.35);opacity:0}}@keyframes logo{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}@keyframes glow{0%,100%{opacity:.65;transform:translateX(-50%) scale(.9)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}:global([data-theme=dark]) .loader-shell{background:radial-gradient(circle at 22% 18%,rgba(72,127,255,.2),transparent 31%),radial-gradient(circle at 78% 78%,rgba(37,99,235,.14),transparent 29%),rgba(2,6,23,.58)}:global([data-theme=dark]) .loader-card{border-color:rgba(148,163,184,.2);background:linear-gradient(145deg,rgba(15,23,42,.9),rgba(30,41,59,.72));box-shadow:0 24px 70px rgba(0,0,0,.4),inset 0 1px rgba(255,255,255,.06)}:global([data-theme=dark]) .brand-mark{border-color:rgba(148,163,184,.18);background:rgba(30,41,59,.8)}:global([data-theme=dark]) .loader-copy p{color:#e2e8f0}:global([data-theme=dark]) .loader-copy span{color:#94a3b8}@media(max-width:575px){.loader-card{width:min(92vw,290px);padding:22px;border-radius:20px}}@media(prefers-reduced-motion:reduce){.brand-mark img,.brand-pulse,.loader-glow,.progress-track span{animation:none}.progress-track span{width:100%;opacity:.65}}
</style>
