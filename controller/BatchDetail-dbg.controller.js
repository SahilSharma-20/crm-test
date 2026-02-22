sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("crm.crmbatchtest.controller.BatchDetail", {
      ALL_STAGES: [
        "HSM",
        "Pickling",
        "Oiling",
        "Rewinding",
        "Color Coating",
        "Galvanizing",
      ],

      // =====================================================
      // ROUTE INIT
      // =====================================================

      onInit: function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("batchDetail")
          .attachPatternMatched(this._onMatched, this);
      },

      _onMatched: function (oEvent) {
        this._batchId = oEvent.getParameter("arguments").id;
        this._renderTree();
      },

      // =====================================================
      // HARDCODED ROUTING DATA (NO MODEL)
      // =====================================================

      _getRoutingData: function (batchId) {
        const routing = {
          H12345: { required: 5, current: 2, delay: 2, sold: false },
          H12346: { required: 2, current: 2, delay: null, sold: true },
          H12347: { required: 3, current: 3, delay: null, sold: false },
          H12348: { required: 5, current: 4, delay: null, sold: false },
          H12349: { required: 5, current: 5, delay: null, sold: false },
          H12350: { required: 1, current: 1, delay: null, sold: true },
          H12351: { required: 4, current: 2, delay: 2, sold: false },
          H12352: { required: 3, current: 1, delay: null, sold: false },
          H12353: { required: 5, current: 5, delay: null, sold: false },
          H12354: { required: 2, current: 0, delay: null, sold: false },
        };

        const config = routing[batchId];
        if (!config) return null;

        const children = [];

        for (let i = 0; i <= config.required; i++) {
          let status = "Pending";

          if (i < config.current) status = "Completed";
          if (i === config.current)
            status = config.sold ? "Sold" : "In Process";

          children.push({
            name: this.ALL_STAGES[i],
            status: status,
            delay: config.delay === i,
          });
        }

        return {
          name: batchId,
          children: children,
        };
      },

      // =====================================================
      // MAIN RENDER
      // =====================================================

      _renderTree: function () {
        const container = document.getElementById("crmProcessTree");
        if (!container) return;

        container.innerHTML = "";

        const data = this._getRoutingData(this._batchId);
        if (!data) return;

        const width = container.clientWidth;
        const isMobile = width < 768;

        const margin = { top: 80, right: 250, bottom: 80, left: 120 };

        let dynamicHeight = 800;

        const svg = d3
          .select(container)
          .append("svg")
          .attr("width", width)
          .attr("height", dynamicHeight)
          .style("background", "#f9fafb")
          .call(
            d3
              .zoom()
              .scaleExtent([0.5, 3])
              .on("zoom", function (event) {
                svgGroup.attr("transform", event.transform);
              }),
          );

        const svgGroup = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

        let i = 0;
        const duration = 500;

        const treeLayout = d3
          .tree()
          .nodeSize([isMobile ? 200 : 180, isMobile ? 200 : 260]);

        let root = d3.hierarchy(data);

        update(root);

        function update(source) {
          const treeData = treeLayout(root);
          const nodes = treeData.descendants();
          const links = treeData.links();

          // 🔥 AUTO HEIGHT BASED ON NODE COUNT
          dynamicHeight = Math.max(800, nodes.length * 180);
          svg.attr("height", dynamicHeight);

          const node = svgGroup
            .selectAll("g.node")
            .data(nodes, (d) => d.id || (d.id = ++i));

          const nodeEnter = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr(
              "transform",
              `translate(${source.y0 || 0},${source.x0 || 0})`,
            );

          // NODE CIRCLE
          nodeEnter
            .append("circle")
            .attr("r", 18)
            .style("fill", (d) => (d.data.delay ? "#e74c3c" : "#2c3e50"));

          // NODE TEXT
          nodeEnter
            .append("text")
            .attr("x", 35)
            .attr("dy", ".35em")
            .style("font-weight", "600")
            .style("font-size", "14px")
            .text((d) => d.data.name);

          // PLUS BUTTON
          nodeEnter
            .append("text")
            .attr("class", "toggleBtn")
            .attr("x", 0)
            .attr("y", -35)
            .attr("font-size", "22px")
            .attr("text-anchor", "middle")
            .attr("cursor", "pointer")
            .text("+")
            .on("click", function (event, d) {
              event.stopPropagation();

              const group = d3.select(this.parentNode);
              const existing = group.select(".detailCard");

              if (!existing.empty()) {
                existing.remove();
                d3.select(this).text("+");
                return;
              }

              d3.select(this).text("−");

              const cardWidth = isMobile ? width - 100 : 320;
              const cardHeight = 150;

              // 🔥 CARD MOVED TO RIGHT SIDE
              const card = group
                .append("g")
                .attr("class", "detailCard")
                .attr("transform", `translate(${isMobile ? 0 : 180},40)`);

              card
                .append("rect")
                .attr("width", cardWidth)
                .attr("height", cardHeight)
                .attr("rx", 12)
                .attr("ry", 12)
                .style("fill", "#ffffff")
                .style("stroke", "#ddd")
                .style("stroke-width", "1.5px")
                .style("filter", "drop-shadow(2px 4px 8px rgba(0,0,0,0.15))");

              const lines = [
                `Plant: CRM01`,
                `Batch: ${root.data.name}`,
                `Stage: ${d.data.name}`,
                `Status: ${d.data.status}`,
                `Delay: ${d.data.delay ? "YES 🔴" : "No 🟢"}`,
              ];

              card
                .selectAll("text")
                .data(lines)
                .enter()
                .append("text")
                .attr("x", 20)
                .attr("y", (line, i) => 35 + i * 25)
                .text((line) => line)
                .attr("font-size", "13px");
            });

          const nodeUpdate = nodeEnter.merge(node);

          nodeUpdate
            .transition()
            .duration(duration)
            .attr("transform", (d) => `translate(${d.y},${d.x})`);

          node.exit().remove();

          const link = svgGroup
            .selectAll("path.link")
            .data(links, (d) => d.target.id);

          link
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .merge(link)
            .transition()
            .duration(duration)
            .attr(
              "d",
              d3
                .linkHorizontal()
                .x((d) => d.y)
                .y((d) => d.x),
            )
            .style("fill", "none")
            .style("stroke", "#ccc")
            .style("stroke-width", "2px");

          link.exit().remove();
        }
      },

      onNavBack: function () {
        this.getOwnerComponent().getRouter().navTo("home");
      },
    });
});