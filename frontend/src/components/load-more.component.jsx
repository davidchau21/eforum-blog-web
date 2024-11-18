const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {
    if (state != null && state.totalDocs > state.results.length) {
    if (state != null && state.totalDocs > state.results.length) {
        return (
            <div className="flex justify-center">
                <button
                    onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1 })}
                    className="text-dark-grey mt-8 px-3 hover:text-emerald-500 rounded-md flex items-center gap-2"
                >
                    Load More
                </button>
            </div>
        );
        }
    }
}

export default LoadMoreDataBtn;