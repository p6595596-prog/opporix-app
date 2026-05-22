function OpportunityCard({ title, type, deadline }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition duration-300">

      <div className="flex justify-between items-center">

        <span className="text-sm bg-blue-500 px-3 py-1 rounded-full">
          {type}
        </span>

        <span className="text-gray-400 text-sm">
          {deadline}
        </span>

      </div>

      <h2 className="text-2xl font-bold mt-6">
        {title}
      </h2>

      <p className="text-gray-400 mt-3">
        Explore this opportunity and apply before deadline.
      </p>

      <button className="mt-6 bg-blue-500 px-5 py-2 rounded-xl hover:bg-blue-600">
        Apply Now
      </button>

    </div>
  )
}

export default OpportunityCard