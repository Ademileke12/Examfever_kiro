import Link from 'next/link'
import Image from 'next/image'

interface Course {
  id: string
  title: string
  instructor: string
  rating: number
  students: number
  duration: string
  level: string
  image: string
  price: string
  category: string
}

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/exam/${course.id}`} className="group">
      <div className="coursera-card overflow-hidden">
        {/* Course Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-sm font-medium">{course.category}</div>
            </div>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium">
              {course.level}
            </span>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3">{course.instructor}</p>
          
          {/* Rating and Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">★</span>
              <span className="font-medium">{course.rating}</span>
              <span>({course.students.toLocaleString()})</span>
            </div>
            <span>{course.duration}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-green-600">{course.price}</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Start Practice →
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}