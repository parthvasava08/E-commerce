import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

import "../assets/css/Dashboard.css";

function Dashboard() {
  const revenueChartRef = useRef(null);
  const statusChartRef = useRef(null);

  useEffect(() => {
    const revenueChart = new Chart(revenueChartRef.current, {
      type: "line",

      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],

        datasets: [
          {
            data: [
              12000, 15000, 14000, 22000, 28000, 31000, 30000, 35000, 38000,
              42000, 46000, 48000,
            ],

            borderColor: "#1f9d55",

            backgroundColor: "rgba(31,157,85,0.08)",

            fill: true,

            tension: 0.4,

            pointRadius: 0,

            borderWidth: 2.5,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            grid: {
              color: "#f0f1f4",
            },

            ticks: {
              callback: (value) => {
                return "₹" + value / 1000 + "k";
              },

              color: "#8b93a1",
            },
          },

          x: {
            grid: {
              display: false,
            },

            ticks: {
              color: "#8b93a1",
            },
          },
        },
      },
    });

    const statusChart = new Chart(statusChartRef.current, {
      type: "doughnut",

      data: {
        datasets: [
          {
            data: [18, 44, 61, 173, 16],

            backgroundColor: [
              "#dd9c1f",
              "#3b6ee8",
              "#8a5cf6",
              "#1f9d55",
              "#e5484d",
            ],

            borderWidth: 0,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        cutout: "72%",

        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });

    return () => {
      revenueChart.destroy();
      statusChart.destroy();
    };
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>

        <p>Welcome back — here's what's happening with your store today</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Revenue</span>

            <div className="stat-icon green">₹</div>
          </div>

          <h2>₹4,82,650</h2>

          <p className="positive">
            ▲ 12.4%
            <span> vs last month</span>
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Orders</span>

            <div className="stat-icon blue">#</div>
          </div>

          <h2>312</h2>

          <p className="positive">
            ▲ 8.1%
            <span> vs last month</span>
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Customers</span>

            <div className="stat-icon violet">@</div>
          </div>

          <h2>560</h2>

          <p className="positive">
            ▲ 15.2%
            <span> vs last month</span>
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Low Stock Items</span>

            <div className="stat-icon amber">!</div>
          </div>

          <h2>6</h2>

          <p className="negative">Needs attention</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Overview</h3>

              <p>Monthly revenue for the current year</p>
            </div>

            <div className="chart-tabs">
              <button className="active">Revenue</button>

              <button>Orders</button>
            </div>
          </div>

          <div className="revenue-chart">
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Orders by Status</h3>

              <p>Current order breakdown</p>
            </div>
          </div>

          <div className="status-container">
            <div className="donut-chart">
              <canvas ref={statusChartRef}></canvas>

              <div className="donut-center">
                <strong>312</strong>
                <span>Orders</span>
              </div>
            </div>

            <div className="status-list">
              <StatusRow color="#dd9c1f" name="Pending" value="18" />

              <StatusRow color="#3b6ee8" name="Confirmed" value="44" />

              <StatusRow color="#8a5cf6" name="Shipped" value="61" />

              <StatusRow color="#1f9d55" name="Delivered" value="173" />

              <StatusRow color="#e5484d" name="Cancelled" value="16" />
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Recent Orders</h3>

              <p>Latest transactions from your store</p>
            </div>

            <button className="view-all">View all →</button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                <OrderRow
                  initials="RM"
                  customer="Rahul Mehta"
                  product="Laptop"
                  status="Delivered"
                  amount="₹2,499"
                  type="delivered"
                />

                <OrderRow
                  initials="AS"
                  customer="Amit Shah"
                  product="Running Shoes"
                  status="Pending"
                  amount="₹899"
                  type="pending"
                />

                <OrderRow
                  initials="PN"
                  customer="Priya Nair"
                  product="Headphones"
                  status="Shipped"
                  amount="₹1,750"
                  type="shipped"
                />

                <OrderRow
                  initials="NK"
                  customer="Neha Kulkarni"
                  product="Keyboard"
                  status="Pending"
                  amount="₹399"
                  type="pending"
                />

                <OrderRow
                  initials="KJ"
                  customer="Karan Joshi"
                  product="Water Bottle"
                  status="Cancelled"
                  amount="₹299"
                  type="cancelled"
                />
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Monthly Goals</h3>

              <p>Track progress toward targets</p>
            </div>
          </div>

          <Goal
            name="Monthly Revenue"
            percentage="88%"
            width="88%"
            current="₹4,82,650"
            target="Target: ₹5,50,000"
          />

          <Goal
            name="New Customers"
            percentage="85%"
            width="85%"
            current="847"
            target="Target: 1,000"
          />

          <Goal
            name="Order Fulfilment"
            percentage="76%"
            width="76%"
            current="234 shipped"
            target="Target: 312"
          />
        </div>
      </div>
    </div>
  );
}

function StatusRow({ color, name, value }) {
  return (
    <div className="status-row">
      <span className="status-dot" style={{ backgroundColor: color }}></span>

      <span className="status-name">{name}</span>

      <strong>{value}</strong>
    </div>
  );
}

function OrderRow({ initials, customer, product, status, amount, type }) {
  return (
    <tr>
      <td>
        <div className="customer">
          <div className="customer-avatar">{initials}</div>

          {customer}
        </div>
      </td>

      <td>{product}</td>

      <td>
        <span className={`status-badge ${type}`}>{status}</span>
      </td>

      <td className="amount">{amount}</td>
    </tr>
  );
}

function Goal({ name, percentage, width, current, target }) {
  return (
    <div className="goal">
      <div className="goal-top">
        <strong>{name}</strong>

        <span>{percentage}</span>
      </div>

      <div className="goal-bar">
        <div style={{ width: width }}></div>
      </div>

      <div className="goal-bottom">
        <span>{current}</span>

        <span>{target}</span>
      </div>
    </div>
  );
}

export default Dashboard;
