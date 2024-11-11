const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {

    if (state != null && state.totalDocs > state.results.length) {
        return (
            <div className="flex justify-center mt-4">
                <button
                    onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1 })}
                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
                >
                    Load More
                </button>
            </div>
        )
    }

}

export default LoadMoreDataBtn;