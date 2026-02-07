import { useDispatch, useSelector } from "react-redux";
import { increment, decrement, reset } from "../../../redux/slices/counterSlice";

const HomePage = () => {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-80 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Redux Test Home
        </h1>

        <h2 className="text-4xl font-semibold mb-6 text-indigo-600">
          {count}
        </h2>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => dispatch(decrement())}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            −
          </button>

          <button
            onClick={() => dispatch(increment())}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            +
          </button>
        </div>

        <button
          onClick={() => dispatch(reset())}
          className="mt-5 w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
        >
          Reset
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Refresh page — value should persist.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
