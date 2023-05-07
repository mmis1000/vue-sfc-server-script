<template>
    <template v-if="!complaint">
        <form :action="$actions.submitComplaint" method="post">
            <input type="text" name="user" placeholder="User">
            <input type="text" name="complaint" placeholder="Complaint">
            <button>Submit Complaint</button>
        </form>
    </template>
    <template v-else>
        {{ complaint.user }} complain about <code>{{ complaint.complaint }}</code>
    </template>
</template>

<script:server lang="ts">
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { redirect } from '../plugin/server-function-utils.ts'
import { mkdirSync } from 'fs'
import { join } from 'path'
const dir = join(__dirname, '../temp')
const file = join(dir, 'db.json')
mkdirSync(dir, { recursive: true });

const adapter = new JSONFile(file)
const defaultData = { complaints: [] }
const db = new Low(adapter, defaultData)

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const submitComplaint: () => Promise<number> = async ({ user, complaint }) => {
    const id = uuidv4()
    await db.read()
    console.log('someone added a complaint!', user, complaint)
    db.data.complaints.push({
        id,
        user,
        complaint
    })
    await db.write()
    redirect(`/complaint/${id}`)
}
export const getComplaint: () => Promise<number> = async ({ id }) => {
    await db.read()
    const item = db.data.complaints.find(i => i.id === id)
    if (item) {
        return item
    } else {
        return null
    }
}
</script:server>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useServerMethods } from '../plugin/useServerMethods';

const b = 1
const serverMethods = useServerMethods()
const id = /^\/complaint\/(.+)$/.exec(location.pathname)?.[1]

const complaint = ref<null | {
    id: string,
    user: string,
    complaint: string
} >(null)

onMounted(async () => {
    if (id != null) {
        complaint.value = await serverMethods.getComplaint({ id })
    }
})
</script>

<style></style>