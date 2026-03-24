import React, { Component } from "react";
import CanvasJSReact from "@canvasjs/react-charts";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

interface AppState {
  dataPoints: { x: Date; y: number[] }[];
  isLoaded: boolean;
}

class App extends Component<{}, AppState> {
  // Khai báo ref cho chart và kiểu 'any'
  private chart: any;

  constructor(props: {}) {
    super(props);
    this.state = { dataPoints: [], isLoaded: false };
    this.chart = React.createRef(); // Khởi tạo ref
  }

  render() {
    const options = {
      data: [
        {
          type: "candlestick",
          dataPoints: this.state.dataPoints,
        },
      ],
    };

    return (
      <div>
        {this.state.isLoaded && (
          <CanvasJSChart
            options={options}
            onRef={(ref: any) => (this.chart = ref)} // Truyền ref vào chart
          />
        )}
      </div>
    );
  }

  componentDidMount() {
    fetch("https://canvasjs.com/data/gallery/react/microsoft-stock-price.json")
      .then((response) => response.json())
      .then((data) => {
        const dps = data.map((item: { x: number; y: number[] }) => ({
          x: new Date(item.x), // Convert timestamp to Date
          y: item.y,
        }));

        this.setState({
          isLoaded: true,
          dataPoints: dps,
        });
      });
  }
}

export default App;
