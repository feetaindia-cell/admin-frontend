<template>
    <div class="dashboard-main-body"><div class="row gy-4">
            <MarketData />
            <MarketSidebar />
        </div>
    </div>
</template>
<script>import MarketData from '@/components/CryptoCurrency/MarketplaceDetails/MarketData.vue'
import MarketSidebar from '@/components/CryptoCurrency/MarketplaceDetails/MarketSidebar.vue'

export default {
    name: "MarketplaceDetails",
    components: {MarketData,
        MarketSidebar
    },
}
</script>