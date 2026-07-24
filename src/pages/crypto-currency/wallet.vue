<template>
    <div class="dashboard-main-body"><div class="row gy-4">
            <WalletData />
            <WalletList />
        </div>
    </div>

</template>
<script>import WalletData from '@/components/CryptoCurrency/Wallet/WalletData.vue'
import WalletList from '@/components/CryptoCurrency/Wallet/WalletList.vue'

export default {
    name: "Wallet",
    components: {WalletData,
        WalletList
    },
}
</script>