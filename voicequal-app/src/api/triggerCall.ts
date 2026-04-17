const N8N_WEBHOOK_URL = 'https://vinit123.app.n8n.cloud/webhook/3817e448-1501-43b2-a880-f4eb0848e404'

export async function triggerCall(leadPhone?: string, leadName?: string) {
  const url = new URL(N8N_WEBHOOK_URL)
  if (leadPhone) url.searchParams.set('phone', leadPhone)
  if (leadName) url.searchParams.set('name', leadName)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`)
  }

  return response.json().catch(() => ({ success: true }))
}
