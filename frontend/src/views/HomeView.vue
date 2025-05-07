<script setup lang="ts">
// Home page logic

// Scroll to video section when "Watch video" button is clicked
const scrollToVideo = () => {
  const videoSection = document.getElementById('video-section')
  if (videoSection) {
    videoSection.scrollIntoView({ behavior: 'smooth' })

    // Add a slight delay before playing the video to allow scrolling to complete
    setTimeout(() => {
      // Get the iframe element
      const iframe = document.querySelector('#video-section iframe') as HTMLIFrameElement
      if (iframe) {
        let currentSrc = iframe.src
        // Remove any existing autoplay parameter if present
        currentSrc = currentSrc.replace(/(\?|&)autoplay=1/, '')

        // Add autoplay parameter
        iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'autoplay=1&mute=1'
      }
    }, 800) // Delay of 800ms
  }
}
</script>

<template>
  <div class="home">
    <!-- Hero section with dark background -->
    <div class="hero-section">
      <!-- Background gradients -->
      <div class="gradient-orb gradient-orb-1"></div>
      <div class="gradient-orb gradient-orb-2"></div>

      <!-- Navbar is now handled by AppLayout.vue -->

      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">Manage everything<br />with Proza</h1>
          <p class="hero-tagline">The best project management tool</p>

          <div class="hero-buttons">
            <router-link to="/login" class="btn btn-primary"> Start for free </router-link>
            <button @click="scrollToVideo" class="btn btn-secondary">Watch video</button>
          </div>

          <!-- Video placeholder with badge -->
          <div class="video-wrapper">
            <div class="date-badge">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="badge-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Vip vip coming up
            </div>

            <div id="video-section" class="video-container">
              <!-- YouTube video iframe -->
              <div class="framer-editor">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/tyITq3LCWXo?si=K-H5qKEdsK7Rr7My"
                  title="Framer Introduction"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.hero-section {
  position: relative;
  background-color: black;
  color: white;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
}

/* Gradient orbs for background effect like in the image */
.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 1;
}

.gradient-orb-1 {
  width: 80vw;
  height: 80vw;
  background: radial-gradient(circle at center, rgba(0, 82, 255, 0.4) 0%, rgba(0, 82, 255, 0) 70%);
  top: 10%;
  left: -30%;
}

.gradient-orb-2 {
  width: 100vw;
  height: 100vw;
  background: radial-gradient(circle at center, rgba(0, 42, 255, 0.4) 0%, rgba(0, 42, 255, 0) 65%);
  bottom: -60%;
  right: -40%;
}

/* Hero content */
.hero-container {
  position: relative;
  z-index: 5;
  padding: 0 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 8rem;
}

.hero-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1200px;
  width: 100%;
}

.hero-title {
  font-size: clamp(2rem, 8vw, 7rem);
  font-weight: 700;
  line-height: 1;
  margin-bottom: 1.5rem;
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.hero-tagline {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.2s;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 4rem;
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.3s;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: white;
  color: black;
  border: none;
}

.btn-primary:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.btn-secondary {
  background-color: rgba(23, 23, 23, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background-color: rgba(40, 40, 40, 0.8);
}

/* Video section */
.video-wrapper {
  position: relative;
  width: 100%;
  margin-top: 2rem;
  animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.4s;
}

.date-badge {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2;
  white-space: nowrap;
}

.badge-icon {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.video-container {
  width: 100%;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.framer-editor {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #0e0e11;
  overflow: hidden;
}

.editor-content {
  width: 100%;
  height: 100%;
}

.editor-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Animations */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Media queries for responsiveness */
@media (max-width: 768px) {
  .hero-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .hero-title {
    font-size: 3rem;
  }
}
</style>
