# Vue SFC server script

A actual working implementation of [this twitter post](https://twitter.com/_hyf0/status/1654521901631541251?s=20)

warning: this repo acts as a material as shit post. it isn't intended for someone to actually use in prod.  
note: the typescript checking don't actually work because i don't care.

```html
<template>
    <form :action="$actions.submitComplaint" method="post">
        <input type="text" name="user" placeholder="User">
        <input type="text" name="complaint" placeholder="Complaint">
        <button>Submit Complaint</button>
    </form>
</template>
<script:server lang="ts">
export const submitComplaint = async ({ user, complaint }) => {
    console.log('someone added a complaint!', user, complaint)
    redirect(`/complaint/finished`)
}
</script:server>
```