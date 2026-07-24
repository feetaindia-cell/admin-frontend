<template>
  <div class="dashboard-main-body news-form-page">
    <span class="news-bg-blob news-bg-blob--blue" aria-hidden="true"></span>
    <span class="news-bg-blob news-bg-blob--violet" aria-hidden="true"></span>
    <span class="news-bg-blob news-bg-blob--indigo" aria-hidden="true"></span>

    <section class="news-form-header" aria-labelledby="news-form-title">
      <div class="news-form-header__title">
        <span class="news-form-header__icon" aria-hidden="true">
          <iconify-icon icon="ri:newspaper-line"></iconify-icon>
        </span>
        <div>
          <h1 id="news-form-title">{{ isEdit ? 'Edit News' : 'Create News' }}</h1>
          <p>{{ isEdit ? 'Update article content, visibility and publishing state.' : 'Create and publish engaging news articles for your users.' }}</p>
        </div>
      </div>

      <aside class="news-progress-widget" aria-label="Publishing progress">
        <span class="news-progress-widget__pulse" aria-hidden="true"></span>
        <div>
          <strong>Publishing flow</strong>
          <span>Draft -> Ready -> Publish</span>
        </div>
      </aside>
    </section>

    <div v-if="error" class="news-form-alert" role="alert">
      <iconify-icon icon="ri:error-warning-line" aria-hidden="true"></iconify-icon>
      <span>{{ error }}</span>
    </div>

    <form class="news-form-shell" @submit.prevent="submit">
      <section class="news-form-card news-form-card--editor" aria-label="News content">
        <div class="news-editor-hero">
          <div>
            <span class="news-hero-kicker">Content Studio</span>
            <h2>{{ isEdit ? 'Edit News' : 'Create News' }}</h2>
            <p>Write, polish and prepare your announcement in one focused workspace.</p>
          </div>
          <div class="news-hero-art" aria-hidden="true">
            <span class="news-hero-art__sheet"></span>
            <span class="news-hero-art__sheet news-hero-art__sheet--back"></span>
            <iconify-icon icon="ri:newspaper-line"></iconify-icon>
            <i></i>
          </div>
        </div>

        <div class="news-field">
          <label for="news-title">
            <span class="news-label-icon is-purple" aria-hidden="true"><iconify-icon icon="ri:text"></iconify-icon></span>
            Title <em aria-hidden="true">*</em>
          </label>
          <div :class="['news-input-wrap', { 'has-error': errors.title }]">
            <input id="news-title" v-model="form.title" type="text" placeholder="Enter news title" aria-label="News title" />
          </div>
          <div v-if="errors.title" class="news-field-error">
            <iconify-icon icon="ri:error-warning-line" aria-hidden="true"></iconify-icon>
            {{ errors.title[0] }}
          </div>
        </div>

        <div class="news-field">
          <label for="news-short-description">
            <span class="news-label-icon is-blue" aria-hidden="true"><iconify-icon icon="ri:align-left"></iconify-icon></span>
            Description
          </label>
          <div class="news-textarea-wrap">
            <textarea id="news-short-description" v-model="form.short_description" class="news-textarea" rows="3" placeholder="Write a short summary for the list page" aria-label="Short description"></textarea>
            <span class="news-counter">{{ form.short_description.length }} chars</span>
          </div>
        </div>

        <div class="news-field news-field--editor">
          <label>
            <span class="news-label-icon is-green" aria-hidden="true"><iconify-icon icon="ri:file-text-line"></iconify-icon></span>
            Content <em aria-hidden="true">*</em>
          </label>
          <div :class="['news-editor-wrap', { 'has-error': errors.content }]">
            <RichTextEditor v-model="form.content" />
          </div>
          <div v-if="errors.content" class="news-field-error">
            <iconify-icon icon="ri:error-warning-line" aria-hidden="true"></iconify-icon>
            {{ errors.content[0] }}
          </div>
        </div>

        <div class="news-option-grid">
          <div class="news-field news-field--option">
            <label for="news-status">
              <span class="news-label-icon is-orange" aria-hidden="true"><iconify-icon icon="ri:flag-line"></iconify-icon></span>
              Status
            </label>
            <div class="news-select-card">
              <span :class="['news-status-dot', `is-${form.status}`]" aria-hidden="true"></span>
              <div>
                <strong>{{ form.status }}</strong>
                <span>Publishing state</span>
              </div>
              <select id="news-status" v-model="form.status" aria-label="Status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <iconify-icon icon="ri:arrow-down-s-line" aria-hidden="true"></iconify-icon>
            </div>
          </div>

          <div class="news-field news-field--option">
            <label for="news-visibility">
              <span class="news-label-icon is-indigo" aria-hidden="true"><iconify-icon icon="ri:eye-line"></iconify-icon></span>
              Visibility
            </label>
            <div class="news-select-card">
              <span class="news-select-card__glyph" aria-hidden="true">
                <iconify-icon :icon="form.visibility === 'private' ? 'ri:lock-line' : 'ri:global-line'"></iconify-icon>
              </span>
              <div>
                <strong>{{ form.visibility }}</strong>
                <span>Audience access</span>
              </div>
              <select id="news-visibility" v-model="form.visibility" aria-label="Visibility">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <iconify-icon icon="ri:arrow-down-s-line" aria-hidden="true"></iconify-icon>
            </div>
          </div>
        </div>

        <div class="news-field">
          <label for="news-featured-image">
            <span class="news-label-icon is-pink" aria-hidden="true"><iconify-icon icon="ri:image-line"></iconify-icon></span>
            Featured Image
          </label>
          <div class="news-upload">
            <div v-if="imagePreview" class="news-upload__preview">
              <button type="button" class="news-upload__remove" aria-label="Remove featured image" @click="removeImage">
                <iconify-icon icon="ri:close-line"></iconify-icon>
              </button>
              <img :src="imagePreview" alt="Featured image" />
            </div>
            <label v-else class="news-upload__dropzone" for="news-featured-image">
              <span class="news-upload__icon" aria-hidden="true"><iconify-icon icon="ri:upload-cloud-2-line"></iconify-icon></span>
              <strong>Drag & Drop Image</strong>
              <span>or Browse</span>
              <small>Recommended 1200 x 630, maximum 2 MB</small>
            </label>
            <input id="news-featured-image" type="file" accept="image/*" hidden @change="handleImage" />
            <label v-if="imagePreview" class="news-upload__change" for="news-featured-image">
              <iconify-icon icon="ri:image-edit-line" aria-hidden="true"></iconify-icon>
              Change image
            </label>
          </div>
        </div>
      </section>

      <aside class="news-form-side">
        <section class="news-guide-card" aria-label="Publishing guide">
          <div class="news-guide-card__header">
            <span aria-hidden="true"><iconify-icon icon="ri:compass-3-line"></iconify-icon></span>
            <div>
              <h2>Publishing Guide</h2>
              <p>Review the essentials before publishing.</p>
            </div>
          </div>

          <ul class="news-guide-list">
            <li :class="{ 'is-complete': form.title }">
              <iconify-icon icon="ri:check-line" aria-hidden="true"></iconify-icon>
              Title completed
            </li>
            <li :class="{ 'is-complete': form.short_description }">
              <iconify-icon icon="ri:check-line" aria-hidden="true"></iconify-icon>
              Short description
            </li>
            <li :class="{ 'is-complete': form.content }">
              <iconify-icon icon="ri:check-line" aria-hidden="true"></iconify-icon>
              Content added
            </li>
            <li :class="{ 'is-complete': imagePreview }">
              <iconify-icon icon="ri:check-line" aria-hidden="true"></iconify-icon>
              Featured image
            </li>
            <li class="is-complete">
              <iconify-icon icon="ri:check-line" aria-hidden="true"></iconify-icon>
              Visibility
            </li>
            <li class="is-complete">
              <iconify-icon icon="ri:check-line" aria-hidden="true"></iconify-icon>
              Status
            </li>
          </ul>
        </section>

        <section class="news-tips-card" aria-label="Publishing tips">
          <h2>Tips</h2>
          <div class="news-tip">
            <span class="is-blue" aria-hidden="true"><iconify-icon icon="ri:image-2-line"></iconify-icon></span>
            <p><strong>Best image size</strong>1200 x 630 works well across previews.</p>
          </div>
          <div class="news-tip">
            <span class="is-purple" aria-hidden="true"><iconify-icon icon="ri:search-eye-line"></iconify-icon></span>
            <p><strong>SEO friendly title</strong>Keep it clear, useful and direct.</p>
          </div>
          <div class="news-tip">
            <span class="is-orange" aria-hidden="true"><iconify-icon icon="ri:quill-pen-line"></iconify-icon></span>
            <p><strong>Description length</strong>A concise summary improves scanning.</p>
          </div>
        </section>

        <section class="news-info-box" aria-label="Publishing behavior">
          <span aria-hidden="true"><iconify-icon icon="ri:information-line"></iconify-icon></span>
          <div>
            <h2>Publishing behavior</h2>
            <p>Draft news should not create notifications. Publishing creates notifications. Use publish, archive, or draft actions from the list after creation when needed.</p>
          </div>
        </section>
      </aside>

      <div class="news-form-actions">
        <router-link to="/news" class="news-btn news-btn--cancel">
          <iconify-icon icon="ri:close-line" aria-hidden="true"></iconify-icon>
          Cancel
        </router-link>
        <button type="button" class="news-btn news-btn--draft" disabled aria-label="Save draft">
          <iconify-icon icon="ri:draft-line" aria-hidden="true"></iconify-icon>
          Save Draft
        </button>
        <button type="submit" :disabled="saving" class="news-btn news-btn--save" aria-label="Save news">
          <iconify-icon :icon="saving ? 'ri:loader-4-line' : 'ri:send-plane-line'" :class="{ 'is-spinning': saving }" aria-hidden="true"></iconify-icon>
          {{ saving ? 'Saving...' : (form.status === 'published' ? 'Publish News' : 'Save News') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import newsService from '@/services/newsService'
import { newsMediaUrl } from '@/utils/mediaUrl'

const props = defineProps({ mode: { type: String, default: 'create' } })
const route = useRoute()
const router = useRouter()
const isEdit = computed(() => props.mode === 'edit')
const saving = ref(false)
const error = ref('')
const errors = ref({})
const imagePreview = ref('')
const form = reactive({ title: '', short_description: '', content: '', status: 'draft', visibility: 'public', featured_image: null })

async function loadPost() {
  if (!isEdit.value) return
  const post = await newsService.get(route.params.id)
  Object.assign(form, {
    title: post.title || '',
    short_description: post.short_description || '',
    content: post.content || '',
    status: post.status || 'draft',
    visibility: post.visibility || 'public',
    featured_image: null,
  })
  imagePreview.value = newsMediaUrl(post.featured_image_url || post.featured_image || '')
}

function handleImage(event) {
  const file = event.target.files[0]
  if (!file) return
  form.featured_image = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  form.featured_image = null
  imagePreview.value = ''
}

async function submit() {
  saving.value = true
  error.value = ''
  errors.value = {}
  try {
    const payload = { ...form }
    if (!payload.featured_image) delete payload.featured_image
    if (isEdit.value) await newsService.update(route.params.id, payload)
    else await newsService.create(payload)
    router.push('/news')
  } catch (err) {
    errors.value = err.errors || {}
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(loadPost)
</script>

<style scoped>
.news-form-page {
  --news-primary: #2563eb;
  --news-primary-dark: #1d4ed8;
  --news-purple: #7c3aed;
  --news-green: #22c55e;
  --news-orange: #f59e0b;
  --news-red: #ef4444;
  --news-pink: #ec4899;
  --news-indigo: #4f46e5;
  --news-text: #0f172a;
  --news-muted: #64748b;
  --news-border: rgba(148, 163, 184, .24);
  --news-card: rgba(255, 255, 255, .84);
  --news-shadow: 0 20px 60px rgba(15, 23, 42, .08);
  position: relative;
  isolation: isolate;
  min-height: calc(100vh - 72px);
  background: linear-gradient(180deg, #f8faff 0%, #f4f7fc 100%);
  color: var(--news-text);
  font-family: Inter, inherit;
}

.news-bg-blob {
  position: fixed;
  z-index: -1;
  width: 240px;
  height: 240px;
  border-radius: 999px;
  opacity: .22;
  filter: blur(48px);
  pointer-events: none;
}

.news-bg-blob--blue {
  top: 92px;
  right: 13%;
  background: #60a5fa;
}

.news-bg-blob--violet {
  top: 340px;
  left: 20%;
  background: #a78bfa;
}

.news-bg-blob--indigo {
  right: 4%;
  bottom: 8%;
  background: #818cf8;
}

.news-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  animation: news-fade-up .28s ease both;
}

.news-form-header__title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.news-form-header__icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 48px;
  border: 1px solid rgba(37, 99, 235, .16);
  border-radius: 17px;
  color: var(--news-primary);
  background: linear-gradient(145deg, rgba(255, 255, 255, .95), rgba(219, 234, 254, .74));
  box-shadow: 0 14px 30px rgba(37, 99, 235, .12);
}

.news-form-header__icon iconify-icon { font-size: 23px; }

.news-form-header h1 {
  margin: 0;
  color: var(--news-text);
  font-size: 34px;
  line-height: 1.15;
  font-weight: 760;
  letter-spacing: 0;
}

.news-form-header p {
  margin: 5px 0 0;
  color: var(--news-muted);
  font-size: 15px;
  line-height: 1.45;
}

.news-progress-widget {
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(226, 232, 240, .88);
  border-radius: 18px;
  background: rgba(255, 255, 255, .72);
  box-shadow: 0 16px 40px rgba(15, 23, 42, .06);
  backdrop-filter: blur(16px);
}

.news-progress-widget__pulse {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--news-green);
  box-shadow: 0 0 0 0 rgba(34, 197, 94, .34);
  animation: news-pulse 1.65s ease-out infinite;
}

.news-progress-widget strong,
.news-progress-widget span {
  display: block;
}

.news-progress-widget strong {
  color: #0f172a;
  font-size: 13px;
  line-height: 1.2;
  font-weight: 760;
}

.news-progress-widget span {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
  font-weight: 650;
}

.news-form-alert {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 10px 14px;
  border: 1px solid #fecaca;
  border-radius: 16px;
  color: #b91c1c;
  background: rgba(254, 242, 242, .9);
  box-shadow: 0 12px 28px rgba(239, 68, 68, .08);
  font-size: 14px;
}

.news-form-shell {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(280px, 3fr);
  gap: 18px;
  align-items: start;
  padding-bottom: 86px;
}

.news-form-card,
.news-guide-card,
.news-tips-card,
.news-info-box {
  border: 1px solid rgba(226, 232, 240, .88);
  border-radius: 24px;
  background: var(--news-card);
  box-shadow: var(--news-shadow);
  backdrop-filter: blur(18px);
}

.news-form-card--editor {
  min-width: 0;
  padding: 24px;
  animation: news-fade-up .34s ease both;
}

.news-editor-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px;
  gap: 18px;
  align-items: center;
  min-height: 160px;
  margin-bottom: 24px;
  padding: 22px 24px;
  overflow: hidden;
  border: 1px solid rgba(219, 234, 254, .86);
  border-radius: 24px;
  background:
    radial-gradient(circle at 82% 16%, rgba(124, 58, 237, .22), transparent 30%),
    linear-gradient(135deg, rgba(239, 246, 255, .92), rgba(255, 255, 255, .74));
}

.news-hero-kicker {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(37, 99, 235, .14);
  border-radius: 999px;
  color: var(--news-primary);
  background: rgba(255, 255, 255, .72);
  font-size: 12px;
  font-weight: 760;
}

.news-editor-hero h2 {
  margin: 10px 0 6px;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 790;
  letter-spacing: 0;
}

.news-editor-hero p {
  max-width: 520px;
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.5;
}

.news-hero-art {
  position: relative;
  display: grid;
  place-items: center;
  height: 128px;
}

.news-hero-art__sheet {
  position: absolute;
  width: 88px;
  height: 112px;
  border: 1px solid rgba(148, 163, 184, .2);
  border-radius: 18px;
  background:
    linear-gradient(#dbeafe 0 0) 18px 26px / 48px 7px no-repeat,
    linear-gradient(#e0e7ff 0 0) 18px 42px / 62px 6px no-repeat,
    linear-gradient(#eef2ff 0 0) 18px 56px / 54px 6px no-repeat,
    rgba(255, 255, 255, .92);
  box-shadow: 0 20px 42px rgba(37, 99, 235, .18);
  transform: rotate(7deg);
}

.news-hero-art__sheet--back {
  transform: translate(-22px, 10px) rotate(-9deg);
  opacity: .68;
}

.news-hero-art > iconify-icon {
  position: relative;
  z-index: 1;
  color: var(--news-primary);
  font-size: 44px;
}

.news-hero-art i {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #f472b6);
  box-shadow: 0 0 0 8px rgba(244, 114, 182, .12);
}

.news-form-side {
  display: grid;
  gap: 16px;
  min-width: 0;
  animation: news-fade-up .38s ease both;
}

.news-field {
  margin-bottom: 18px;
}

.news-field:last-child {
  margin-bottom: 0;
}

.news-field label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 720;
}

.news-field label em {
  color: var(--news-red);
  font-style: normal;
}

.news-label-icon {
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f8fafc;
}

.news-label-icon iconify-icon { font-size: 15px; }
.news-label-icon.is-purple { color: var(--news-purple); background: #f5f3ff; }
.news-label-icon.is-blue { color: var(--news-primary); background: #eff6ff; }
.news-label-icon.is-green { color: #16a34a; background: #ecfdf3; }
.news-label-icon.is-orange { color: #d97706; background: #fff7ed; }
.news-label-icon.is-indigo { color: var(--news-indigo); background: #eef2ff; }
.news-label-icon.is-pink { color: var(--news-pink); background: #fdf2f8; }

.news-input-wrap {
  position: relative;
  min-height: 56px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: rgba(248, 250, 252, .86);
  transition: border-color .22s ease, box-shadow .22s ease, background-color .22s ease, transform .22s ease;
}

.news-input-wrap:focus-within,
.news-textarea-wrap:focus-within,
.news-select-card:focus-within,
.news-editor-wrap:focus-within {
  border-color: rgba(37, 99, 235, .58);
  background: rgba(255, 255, 255, .98);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, .12);
}

.news-input-wrap.has-error,
.news-editor-wrap.has-error {
  border-color: #fca5a5;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, .1);
}

.news-input-wrap input {
  width: 100%;
  min-height: 54px;
  padding: 0 16px;
  border: 0;
  outline: 0;
  color: #0f172a;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
}

.news-input-wrap input::placeholder,
.news-textarea::placeholder {
  color: #a0aec0;
  font-weight: 500;
}

.news-textarea-wrap {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: rgba(248, 250, 252, .86);
  transition: border-color .22s ease, box-shadow .22s ease, background-color .22s ease;
}

.news-textarea {
  width: 100%;
  min-height: 118px;
  padding: 14px 16px 34px;
  border: 0;
  outline: 0;
  resize: vertical;
  color: #0f172a;
  background: transparent;
  font-size: 14px;
  line-height: 1.55;
}

.news-counter {
  position: absolute;
  right: 14px;
  bottom: 10px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.news-editor-wrap {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: rgba(255, 255, 255, .92);
  transition: border-color .22s ease, box-shadow .22s ease, background-color .22s ease;
}

.news-editor-wrap :deep(.ql-toolbar) {
  margin: 10px;
  border: 0;
  border-radius: 14px;
  background: #f8fafc;
}

.news-editor-wrap :deep(.ql-toolbar .ql-formats) {
  margin-right: 8px;
}

.news-editor-wrap :deep(.ql-toolbar button) {
  width: 30px;
  height: 30px;
  margin: 1px;
  border-radius: 10px;
  transition: background-color .18s ease, transform .18s ease;
}

.news-editor-wrap :deep(.ql-toolbar button:hover),
.news-editor-wrap :deep(.ql-toolbar button.ql-active) {
  background: #e0edff;
  transform: translateY(-1px);
}

.news-editor-wrap :deep(.ql-container) {
  min-height: 280px;
  border: 0;
  font-size: 14px;
}

.news-editor-wrap :deep(.ql-editor) {
  padding: 18px;
  color: #0f172a;
  line-height: 1.68;
}

.news-field-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 7px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
}

.news-option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.news-field--option {
  margin-bottom: 18px;
}

.news-select-card {
  position: relative;
  min-height: 74px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 20px;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: rgba(248, 250, 252, .9);
  transition: border-color .22s ease, box-shadow .22s ease, background-color .22s ease, transform .22s ease;
}

.news-select-card:hover,
.news-guide-list li:hover,
.news-tip:hover {
  transform: translateY(-2px);
}

.news-select-card select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.news-select-card strong,
.news-select-card span {
  display: block;
  text-transform: capitalize;
}

.news-select-card strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 780;
}

.news-select-card span {
  color: #64748b;
  font-size: 12px;
  font-weight: 650;
}

.news-select-card > iconify-icon {
  color: #94a3b8;
  font-size: 20px;
}

.news-status-dot,
.news-select-card__glyph {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.news-status-dot {
  position: relative;
  background: #94a3b8;
  box-shadow: inset 0 0 0 12px rgba(255, 255, 255, .72);
}

.news-status-dot.is-draft { background: #94a3b8; }
.news-status-dot.is-published { background: var(--news-green); }
.news-status-dot.is-archived { background: var(--news-orange); }

.news-select-card__glyph {
  color: var(--news-indigo);
  background: #eef2ff;
}

.news-upload {
  display: grid;
  gap: 10px;
}

.news-upload__dropzone,
.news-upload__preview {
  min-height: 214px;
  border: 1px dashed #cbd5e1;
  border-radius: 20px;
  background:
    radial-gradient(circle at 50% 0%, rgba(37, 99, 235, .12), transparent 42%),
    rgba(248, 250, 252, .9);
}

.news-upload__dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  color: #64748b;
  cursor: pointer;
  transition: border-color .22s ease, background-color .22s ease, transform .22s ease, box-shadow .22s ease;
}

.news-upload__dropzone:hover {
  border-color: rgba(37, 99, 235, .54);
  background:
    radial-gradient(circle at 50% 0%, rgba(124, 58, 237, .14), transparent 44%),
    #f8fbff;
  box-shadow: 0 18px 42px rgba(37, 99, 235, .1);
  transform: translateY(-2px);
}

.news-upload__icon {
  width: 54px;
  height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  border-radius: 18px;
  color: var(--news-primary);
  background: #eff6ff;
  box-shadow: 0 12px 26px rgba(37, 99, 235, .12);
}

.news-upload__icon iconify-icon { font-size: 27px; }

.news-upload__dropzone strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 790;
}

.news-upload__dropzone span {
  color: var(--news-primary);
  font-size: 13px;
  font-weight: 760;
}

.news-upload__dropzone small {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 650;
}

.news-upload__preview {
  position: relative;
  overflow: hidden;
}

.news-upload__preview img {
  width: 100%;
  height: 100%;
  min-height: 214px;
  object-fit: cover;
}

.news-upload__remove {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .62);
  border-radius: 50%;
  color: #fff;
  background: rgba(239, 68, 68, .92);
  box-shadow: 0 12px 24px rgba(15, 23, 42, .22);
  transition: transform .18s ease, box-shadow .18s ease;
}

.news-upload__remove:hover {
  transform: scale(1.05);
  box-shadow: 0 16px 32px rgba(15, 23, 42, .26);
}

.news-upload__change {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  color: var(--news-primary);
  background: rgba(239, 246, 255, .88);
  font-size: 14px;
  font-weight: 760;
  cursor: pointer;
  transition: background-color .18s ease, transform .18s ease, box-shadow .18s ease;
}

.news-upload__change:hover {
  background: #dbeafe;
  box-shadow: 0 12px 24px rgba(37, 99, 235, .1);
  transform: translateY(-1px);
}

.news-guide-card,
.news-tips-card,
.news-info-box {
  padding: 18px;
}

.news-guide-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.news-guide-card__header > span {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  border-radius: 15px;
  color: #fff;
  background: linear-gradient(135deg, var(--news-primary), var(--news-purple));
  box-shadow: 0 14px 28px rgba(37, 99, 235, .18);
}

.news-guide-card h2,
.news-tips-card h2,
.news-info-box h2 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  line-height: 1.3;
  font-weight: 790;
}

.news-guide-card p,
.news-info-box p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.news-guide-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.news-guide-list li {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid rgba(226, 232, 240, .84);
  border-radius: 14px;
  color: #64748b;
  background: rgba(248, 250, 252, .72);
  font-size: 13px;
  font-weight: 720;
  transition: transform .18s ease, border-color .18s ease, background-color .18s ease;
}

.news-guide-list iconify-icon {
  width: 22px;
  height: 22px;
  padding: 4px;
  border-radius: 50%;
  color: #94a3b8;
  background: #e2e8f0;
  transition: color .18s ease, background-color .18s ease, transform .18s ease;
}

.news-guide-list li.is-complete {
  color: #166534;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.news-guide-list li.is-complete iconify-icon {
  color: #fff;
  background: var(--news-green);
  transform: scale(1.05);
}

.news-tips-card {
  display: grid;
  gap: 12px;
}

.news-tip {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, .84);
  border-radius: 16px;
  background: rgba(248, 250, 252, .68);
  transition: transform .18s ease, background-color .18s ease, box-shadow .18s ease;
}

.news-tip:hover {
  background: #fff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, .07);
}

.news-tip > span {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 34px;
  border-radius: 12px;
}

.news-tip > span.is-blue { color: var(--news-primary); background: #eff6ff; }
.news-tip > span.is-purple { color: var(--news-purple); background: #f5f3ff; }
.news-tip > span.is-orange { color: #d97706; background: #fff7ed; }

.news-tip p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
}

.news-tip strong {
  display: block;
  margin-bottom: 2px;
  color: #0f172a;
  font-size: 13px;
}

.news-info-box {
  display: flex;
  gap: 12px;
  background: rgba(239, 246, 255, .72);
}

.news-info-box > span {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  border-radius: 14px;
  color: var(--news-primary);
  background: #fff;
}

.news-form-actions {
  position: sticky;
  bottom: 16px;
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 2px;
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, .88);
  border-radius: 20px;
  background: rgba(255, 255, 255, .78);
  box-shadow: 0 20px 50px rgba(15, 23, 42, .1);
  backdrop-filter: blur(18px);
  z-index: 3;
}

.news-btn {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 18px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 780;
  transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease, border-color .18s ease;
}

.news-btn:focus-visible,
.news-upload__dropzone:focus-visible,
.news-upload__change:focus-visible,
.news-upload__remove:focus-visible {
  outline: 3px solid rgba(37, 99, 235, .24);
  outline-offset: 2px;
}

.news-btn--cancel {
  border: 1px solid #fecaca;
  color: #dc2626;
  background: #fff;
}

.news-btn--cancel:hover {
  color: #b91c1c;
  background: #fef2f2;
  box-shadow: 0 12px 28px rgba(239, 68, 68, .1);
  transform: translateY(-2px);
}

.news-btn--draft {
  border: 1px solid #e2e8f0;
  color: #64748b;
  background: #f8fafc;
  cursor: not-allowed;
}

.news-btn--save {
  border: 1px solid transparent;
  color: #fff;
  background: linear-gradient(135deg, var(--news-primary), var(--news-primary-dark));
  box-shadow: 0 16px 32px rgba(37, 99, 235, .24);
}

.news-btn--save:hover:not(:disabled) {
  color: #fff;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 22px 42px rgba(37, 99, 235, .3);
}

.news-btn--save:disabled {
  cursor: not-allowed;
  opacity: .75;
}

.is-spinning {
  animation: news-spin .8s linear infinite;
}

@keyframes news-spin {
  to { transform: rotate(360deg); }
}

@keyframes news-pulse {
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes news-fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1199px) {
  .news-form-shell {
    grid-template-columns: minmax(0, 1fr) 310px;
  }

  .news-editor-hero {
    grid-template-columns: minmax(0, 1fr) 132px;
  }
}

@media (max-width: 991px) {
  .news-form-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .news-progress-widget {
    width: 100%;
  }

  .news-form-shell {
    grid-template-columns: 1fr;
  }

  .news-form-side {
    grid-row: auto;
  }
}

@media (max-width: 767px) {
  .news-form-header h1 {
    font-size: 28px;
  }

  .news-editor-hero,
  .news-option-grid {
    grid-template-columns: 1fr;
  }

  .news-hero-art {
    display: none;
  }
}

@media (max-width: 575px) {
  .news-form-card--editor,
  .news-guide-card,
  .news-tips-card,
  .news-info-box {
    border-radius: 20px;
    padding: 18px;
  }

  .news-editor-hero {
    min-height: auto;
    padding: 18px;
  }

  .news-form-actions {
    position: static;
    flex-direction: column-reverse;
  }

  .news-btn {
    width: 100%;
  }
}
</style>
