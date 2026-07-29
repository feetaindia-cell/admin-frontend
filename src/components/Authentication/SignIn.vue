<template>
  <section class="auth bg-base d-flex flex-wrap">
    <div class="auth-left d-lg-block d-none">
      <div
        class="d-flex align-items-center flex-column h-100 justify-content-center login-intro-panel"
      >
        <img
          :src="loginIntro"
          alt="FEETA admin introduction"
          class="login-intro-image"
        />
      </div>
    </div>
    <div
      class="auth-right py-32 px-24 d-flex flex-column justify-content-center"
    >
      <div class="max-w-464-px mx-auto w-100">
        <div>
          <router-link to="/dashboard" class="mb-40 max-w-290-px">
            <img
              :src="branding.logo"
              :alt="`${branding.appName} logo`"
              class="auth-brand-logo"
            />
          </router-link>
          <h4 class="mb-12">Sign In to FEETA Admin</h4>
          <p class="mb-32 text-secondary-light text-lg">
            Use your admin email and password.
          </p>
        </div>
        <form @submit.prevent="submitLogin">
          <div
            v-if="error"
            class="alert alert-danger bg-danger-100 text-danger-600 border-danger-100 px-16 py-10 radius-8 mb-16"
          >
            {{ error }}
          </div>
          <div class="icon-field mb-16">
            <span class="icon top-50 translate-middle-y">
              <iconify-icon icon="mage:email"></iconify-icon>
            </span>
            <input
              type="email"
              class="form-control h-56-px bg-neutral-50 radius-12"
              placeholder="Email"
              v-model="email"
            />
          </div>
          <div v-if="errors.email" class="text-danger-600 text-sm mt-n12 mb-12">
            {{ errors.email[0] }}
          </div>

          <div class="position-relative mb-20">
            <div class="icon-field">
              <span class="icon top-50 translate-middle-y">
                <iconify-icon icon="solar:lock-password-outline"></iconify-icon>
              </span>
              <input
                :type="showPassword ? 'text' : 'password'"
                class="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Password"
                v-model="password"
              />
            </div>
            <span
              class="toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light"
              :class="{ 'ri-eye-off-line': showPassword }"
              @click="togglePassword"
            ></span>
          </div>
          <div
            v-if="errors.password"
            class="text-danger-600 text-sm mt-n12 mb-12"
          >
            {{ errors.password[0] }}
          </div>

          <div class="d-flex justify-content-between gap-2">
            <div class="form-check style-check d-flex align-items-center">
              <input
                class="form-check-input border border-neutral-300"
                type="checkbox"
                id="remember"
                v-model="remember"
              />
              <label class="form-check-label" for="remember">Remember me</label>
            </div>
            <router-link
              to="/forgot-password"
              class="text-primary-600 fw-medium"
              >Forgot Password?</router-link
            >
          </div>

          <button
            type="submit"
            class="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
            :disabled="loading"
          >
            {{ loading ? "Signing in..." : "Sign In" }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import loginIntro from "@/assets/login/intro.png";
import branding from "@/config/branding";
import { getFirstAllowedSidebarPath } from "@/config/sidebar";
import { useAuthStore } from "@/stores/auth";

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      remember: false,
      error: "",
      errors: {},
    };
  },
  computed: {
    loading() {
      return this.auth.loading;
    },
  },
  setup() {
    const auth = useAuthStore();
    const route = useRoute();
    const router = useRouter();
    return { auth, route, router, branding, loginIntro };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async submitLogin() {
      this.error = "";
      this.errors = {};
      try {
        await this.auth.login({
          email: this.email,
          password: this.password,
          remember: this.remember,
        });
        const redirect = Array.isArray(this.route.query.redirect)
          ? this.route.query.redirect[0]
          : this.route.query.redirect;
        const defaultTarget = getFirstAllowedSidebarPath(this.auth);
        const target =
          typeof redirect === "string" &&
          redirect.startsWith("/") &&
          redirect !== "/dashboard"
            ? redirect
            : defaultTarget;
        this.router.push(target);
      } catch (err) {
        this.errors = err.errors || {};
        this.error = err.message || "Unable to sign in with those credentials.";
      }
    },
  },
};
</script>

<style scoped>
.auth-brand-logo {
  width: 180px;
  max-height: 56px;
  object-fit: contain;
}

.login-intro-panel {
  padding: 48px;
  background: #fff;
}

.login-intro-image {
  width: min(82%, 620px);
  max-height: 82vh;
  object-fit: contain;
}
</style>
