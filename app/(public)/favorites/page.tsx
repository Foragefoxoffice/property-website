import { redirect } from 'next/navigation'

export default function FavoritesRedirectPage() {
  redirect('/user-dashboard/favorites')
}
