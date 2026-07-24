<template>
  <section v-if="payment" class="detail-card"><div class="section-heading"><iconify-icon icon="ri:bank-card-line" /><h6 class="mb-0">Payment summary</h6></div><div class="side-list"><div><span>Status</span><PropertyStatusBadge :status="payment.status" /></div><div><span>Amount paid</span><strong>{{ formatCurrency(payment.amount) }}</strong></div><div><span>Invoice</span><strong>{{ safeValue(payment.invoice_number) }}</strong></div><div><span>Credits used</span><strong>{{ payment.credits_used??0 }}</strong></div><div><span>Paid date</span><strong>{{ formatDate(payment.paid_at,true) }}</strong></div><div><span>Transaction</span><strong>{{ safeValue(payment.razorpay_payment_id) }}</strong></div></div><router-link v-if="payment.id" :to="`/payments/${payment.id}`" class="btn btn-outline-primary-600 w-100 mt-16">View Payment</router-link></section>
</template>
<script setup>
import PropertyStatusBadge from './PropertyStatusBadge.vue'
import { formatCurrency,formatDate,safeValue } from '@/utils/finance'
defineProps({payment:{type:Object,default:null}})
</script>
<style scoped>.detail-card{padding:22px;border:1px solid #e5eaf2;border-radius:14px;background:#fff}.section-heading{display:flex;align-items:center;gap:10px;padding-bottom:15px;margin-bottom:8px;border-bottom:1px solid #edf1f6}.section-heading iconify-icon{color:#487fff;font-size:21px}.side-list>div{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #edf1f6}.side-list span{color:#64748b}.side-list strong{text-align:right;word-break:break-word}</style>
