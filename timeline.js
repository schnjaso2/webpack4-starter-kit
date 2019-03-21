var elem = ".timeline";

var props = {
  width: 1000,
  height: 600,
  class: "timeline-point",

  // margins
  marginTop: 100,
  marginRight: 40,
  marginBottom: 100,
  marginLeft: 60,

  // data inputs
  data: [
    {
      x: 10,
      y: 20,
      key: "a",
      image: "https://unsplash.it/300/300",
      id: "a"
    },
    {
      x: 20,
      y: 10,
      key: "a",
      image: "https://unsplash.it/300/300",
      id: "b"
    },
    {
      x: 60,
      y: 30,
      key: "a",
      image: "https://unsplash.it/300/300",
      id: "c"
    },
    {
      x: 40,
      y: 30,
      key: "a",
      image: "https://unsplash.it/300/300",
      id: "d"
    },
    {
      x: 50,
      y: 70,
      key: "a",
      image: "https://unsplash.it/300/300",
      id: "e"
    },
    {
      x: 30,
      y: 50,
      key: "a",
      image: "https://unsplash.it/300/300",
      id: "f"
    },
    {
      x: 50,
      y: 60,
      key: "a",
      image: "https://unsplash.it/300/300",
      id: "g"
    }
  ],

  // y label
  yLabel: "Y label",
  yLabelLength: 50,

  // axis ticks
  xTicks: 10,
  yTicks: 10

}

// component start
var Timeline = {};

/***
*
* Create the svg canvas on which the chart will be rendered
*
***/

Timeline.create = function(elem, props) {

  // build the chart foundation
  var svg = d3.select(elem).append('svg')
      .attr('width', props.width)
      .attr('height', props.height);

  var g = svg.append('g')
      .attr('class', 'point-container')
      .attr("transform",
              "translate(" + props.marginLeft + "," + props.marginTop + ")");

  var g = svg.append('g')
      .attr('class', 'line-container')
      .attr("transform",
              "translate(" + props.marginLeft + "," + props.marginTop + ")");

  var xAxis = g.append('g')
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (props.height - props.marginTop - props.marginBottom) + ")");

  var yAxis = g.append('g')
    .attr("class", "y axis");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 1)
    .attr("x", 0 - ((props.height - props.yLabelLength)/2) )
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text(props.yLabel);

  // add placeholders for the axes
  this.update(elem, props);
};

/***
*
* Update the svg scales and lines given new data
*
***/

Timeline.update = function(elem, props) {
  var self = this;
  var domain = self.getDomain(props);
  var scales = self.scales(elem, props, domain);

  self.drawPoints(elem, props, scales);
};


/***
*
* Use the range of values in the x,y attributes
* of the incoming data to identify the plot domain
*
***/

Timeline.getDomain = function(props) {
  var domain = {};
  domain.x = props.xDomain || d3.extent(props.data, function(d) { return d.x; });
  domain.y = props.yDomain || d3.extent(props.data, function(d) { return d.y; });
  return domain;
};


/***
*
* Compute the chart scales
*
***/

Timeline.scales = function(elem, props, domain) {

  if (!domain) {
    return null;
  }

  var width = props.width - props.marginRight - props.marginLeft;
  var height = props.height - props.marginTop - props.marginBottom;

  var x = d3.scale.linear()
    .range([0, width])
    .domain(domain.x);

  var y = d3.scale.linear()
    .range([height, 0])
    .domain(domain.y);

  return {x: x, y: y};
};


/***
*
* Create the chart axes
*
***/

Timeline.axes = function(props, scales) {

  var xAxis = d3.svg.axis()
    .scale(scales.x)
    .orient("bottom")
    .ticks(props.xTicks)
    .tickFormat(d3.format("d"));

  var yAxis = d3.svg.axis()
    .scale(scales.y)
    .orient("left")
    .ticks(props.yTicks);

  return {
    xAxis: xAxis,
    yAxis: yAxis
  }
};


/***
*
* Use the general update pattern to draw the points
*
***/

Timeline.drawPoints = function(elem, props, scales, prevScales, dispatcher) {
  var g = d3.select(elem).selectAll('.point-container');
  var color = d3.scale.category10();

  // add images
  var image = g.selectAll('.image')
    .data(props.data)

  image.enter()
    .append("pattern")
    .attr("id", function(d) {return d.id})
    .attr("class", "svg-image")
    .attr("x", "0")
    .attr("y", "0")
    .attr("height", "70px")
    .attr("width", "70px")
    .append("image")
      .attr("x", "0")
      .attr("y", "0")
      .attr("height", "70px")
      .attr("width", "70px")
      .attr("xlink:href", function(d) {return d.image})

  var point = g.selectAll('.point')
    .data(props.data);

  // enter
  point.enter()
    .append("circle")
      .attr("class", "point")
      .on('mouseover', function(d) {
        d3.select(elem).selectAll(".point").classed("active", false);
        d3.select(this).classed("active", true);
        if (props.onMouseover) {
          props.onMouseover(d)
        };
      })
      .on('mouseout', function(d) {
        if (props.onMouseout) {
          props.onMouseout(d)
        };
      })

  // enter and update
  point.transition()
    .duration(1000)
    .attr("cx", function(d) {
      return scales.x(d.x);
    })
    .attr("cy", function(d) {
      return scales.y(d.y);
    })
    .attr("r", 30)
    .style("stroke", function(d) {
      if (props.pointStroke) {
        return d.color = props.pointStroke;
      } else {
        return d.color = color(d.key);
      }
    })
    .style("fill", function(d) {
      if (d.image) {
        return ("url(#" + d.id + ")");
      }

      if (props.pointFill) {
        return d.color = props.pointFill;
      } else {
        return d.color = color(d.key);
      }
    });

  // exit
  point.exit()
    .remove();

  // update the axes
  var axes = this.axes(props, scales);
  d3.select(elem).selectAll('g.x.axis')
    .transition()
    .duration(1000)
    .call(axes.xAxis);

  d3.select(elem).selectAll('g.y.axis')
    .transition()
    .duration(1000)
    .call(axes.yAxis);
};


$(document).ready(function() {
  Timeline.create(elem, props);
})