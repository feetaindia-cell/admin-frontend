<template>
    <div class="dashboard-main-body"><PricingPlanMultipleColor />
        <SimplePricingPlan />
    </div>
</template>
<script>import PricingPlanMultipleColor from '@/components/Pricing/PricingMultipleColor.vue'
import SimplePricingPlan from '@/components/Pricing/SimplePricingPlan.vue'
export default {
    name: "Pricing",
    components: {PricingPlanMultipleColor,
        SimplePricingPlan,
    },
}
</script>