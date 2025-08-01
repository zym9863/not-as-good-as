import { useParams } from 'react-router-dom'
import MemoryDetail from '../components/MemoryDetail'

export default function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>回忆不存在</div>
  }

  return (
    <div className="memory-detail-page">
      <MemoryDetail memoryId={id} />
    </div>
  )
}