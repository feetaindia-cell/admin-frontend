<template>
    <div class="dashboard-main-body"><div class="row gy-4">
            <DefaultCarousel />
            <CarouselArrow />
            <CarouselPagination />
            <CarouselProgress />
            <MultipleSlides />
        </div>

    </div>
</template>
<script>import DefaultCarousel from '@/components/UiComponent/Carousel/DefaultCarousel.vue'
import CarouselArrow from '@/components/UiComponent/Carousel/CarouselArrow.vue'
import CarouselPagination from '@/components/UiComponent/Carousel/CarouselPagination.vue'
import CarouselProgress from '@/components/UiComponent/Carousel/CarouselProgress.vue'
import MultipleSlides from '@/components/UiComponent/Carousel/MultipleSlides.vue'

export default {
    name: "Carousel",
    components: {DefaultCarousel,
        CarouselArrow,
        CarouselPagination,
        CarouselProgress,
        MultipleSlides,
    },
}
</script>