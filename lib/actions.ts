'use server'

import { updateTag } from 'next/cache'

export async function invalidatePages() {
  updateTag('pages')
}

export async function invalidateGallery() {
  updateTag('gallery')
}

export async function invalidateContact() {
  updateTag('contact')
}
