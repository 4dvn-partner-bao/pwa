// src/components/RestaurantMap.js
import React, { useState } from "react";
import GridLayout from "react-grid-layout";

const RestaurantMap = () => {
  const [layout, setLayout] = useState([
    { i: "table-1", x: 0, y: 0, w: 2, h: 2 },
    { i: "chair-1", x: 2, y: 0, w: 1, h: 1 },
    { i: "chair-2", x: 2, y: 1, w: 1, h: 1 },
  ]);

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  return (
    <div className="p-4 bg-gray-100">
      <GridLayout
        className="layout"
        layout={layout}
        cols={20} // Số cột của lưới
        rowHeight={30} // Chiều cao của mỗi hàng
        width={1000} // Chiều rộng của khu vực lưới
        onLayoutChange={onLayoutChange}
      >
        <div
          key="table-1"
          className="bg-blue-500 rounded-lg flex items-center justify-center text-white"
        >
          Bàn 1
        </div>
        <div
          key="chair-1"
          className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white"
        >
          G1
        </div>
        <div
          key="chair-2"
          className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white"
        >
          G2
        </div>
      </GridLayout>
    </div>
  );
};

export default RestaurantMap;
